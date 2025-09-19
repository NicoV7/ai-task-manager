import os
import logging
import json
from typing import Optional, List, Dict
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class ClaudeAIService:
    """Service for interacting with Claude AI API"""

    def __init__(self, user=None):
        """
        Initialize Claude service with user-specific settings

        Args:
            user: Django User instance to get Claude settings for
        """
        self.user = user
        self.api_key = None
        self.model = 'claude-3-5-sonnet-20241022'
        self.max_tokens = 4096
        self.temperature = 0.7

        if user:
            try:
                from apps.ai_assistant.models import UserClaudeSettings
                settings = UserClaudeSettings.objects.get(user=user)
                if settings.has_valid_api_key():
                    self.api_key = settings.api_key
                    self.model = settings.model
                    self.max_tokens = settings.max_tokens
                    self.temperature = settings.temperature
            except Exception as e:
                logger.warning(f"Could not load user Claude settings: {str(e)}")

        # Fallback to environment variable if no user-specific key
        if not self.api_key:
            self.api_key = os.getenv('CLAUDE_API_KEY')
            if not self.api_key:
                logger.warning("No Claude API key found in user settings or environment variables")

    def is_available(self) -> bool:
        """Check if Claude API is available"""
        return bool(self.api_key and self.api_key.startswith('sk-ant-api03-'))
    
    def get_task_suggestion(self, task_title: str, task_description: str, user_message: str) -> str:
        """
        Get AI suggestion for a task based on task details and user message

        Args:
            task_title: The title of the task
            task_description: The description of the task
            user_message: The user's specific question or request

        Returns:
            AI-generated suggestion as a string
        """
        if not self.is_available():
            return "AI service is currently unavailable. Please configure your Claude API key in settings."

        try:
            # Prepare the request
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': self.api_key,
                'anthropic-version': '2023-06-01'
            }

            # Construct the messages
            system_prompt = """You are an AI assistant for a task management application. You help users by providing practical, actionable suggestions for their tasks. Your responses should be:

1. Helpful and specific to the task context
2. Actionable with clear next steps
3. Professional but friendly in tone
4. Concise but comprehensive (aim for 2-4 sentences)
5. Focused on productivity and task completion

When users ask questions about their tasks, provide suggestions that could help them complete the task more effectively, break it down into smaller steps, identify potential challenges, or suggest resources/approaches."""

            user_content = f"""Task: {task_title}

Description: {task_description or "No description provided"}

User Question: {user_message}

Please provide a helpful suggestion for this task."""

            payload = {
                'model': self.model,
                'max_tokens': min(300, self.max_tokens),  # Limit for task suggestions
                'temperature': self.temperature,
                'system': system_prompt,
                'messages': [
                    {
                        'role': 'user',
                        'content': user_content
                    }
                ]
            }

            # Make API call to Claude
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('content') and len(data['content']) > 0:
                    return data['content'][0]['text'].strip()
                else:
                    logger.error("Claude API returned empty response")
                    return "I'm sorry, I couldn't generate a suggestion at this time. Please try again."
            else:
                error_data = response.json() if response.content else {}
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                logger.error(f"Claude API error {response.status_code}: {error_message}")

                if response.status_code == 401:
                    return "AI service authentication failed. Please check your API key in settings."
                elif response.status_code == 429:
                    return "AI service is temporarily busy. Please try again in a moment."
                else:
                    return "AI service encountered an error. Please try again later."

        except requests.exceptions.Timeout:
            logger.error("Claude API request timeout")
            return "AI service request timed out. Please try again."

        except requests.exceptions.RequestException as e:
            logger.error(f"Claude API request error: {str(e)}")
            return "AI service connection error. Please check your internet connection."

        except Exception as e:
            logger.error(f"Unexpected error in Claude AI service: {str(e)}")
            return "An unexpected error occurred. Please try again later."
    
    def breakdown_task(self, task_title: str, task_description: str) -> List[Dict[str, str]]:
        """
        Break down a complex task into smaller subtasks using AI

        Args:
            task_title: The title of the task to break down
            task_description: The description of the task

        Returns:
            List of dictionaries with subtask information
        """
        if not self.is_available():
            return []

        try:
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': self.api_key,
                'anthropic-version': '2023-06-01'
            }

            system_prompt = """You are an AI assistant that helps break down complex tasks into smaller, manageable subtasks.

Your response must be a valid JSON array containing objects with these exact fields:
- "title": A clear, concise title for the subtask (max 100 characters)
- "description": A detailed description of what needs to be done for this subtask
- "priority": One of: "low", "medium", "high", "urgent"

Guidelines:
1. Break the task into 3-8 logical subtasks
2. Each subtask should be specific and actionable
3. Order subtasks logically (dependencies first)
4. Make subtasks small enough to complete in a reasonable time
5. Ensure each subtask contributes to the overall goal
6. Assign appropriate priorities based on importance and dependencies

Return ONLY the JSON array, no other text."""

            user_content = f"""Task to break down:
Title: {task_title}
Description: {task_description or "No description provided"}

Please break this task into smaller, manageable subtasks. Return as JSON array only."""

            payload = {
                'model': self.model,
                'max_tokens': min(1000, self.max_tokens),
                'temperature': 0.3,  # Lower temperature for more consistent JSON format
                'system': system_prompt,
                'messages': [
                    {
                        'role': 'user',
                        'content': user_content
                    }
                ]
            }

            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('content') and len(data['content']) > 0:
                    response_text = data['content'][0]['text'].strip()

                    # Extract JSON from the response
                    try:
                        # Try to parse the response as JSON
                        subtasks = json.loads(response_text)

                        # Validate the structure
                        if isinstance(subtasks, list):
                            validated_subtasks = []
                            for subtask in subtasks:
                                if isinstance(subtask, dict) and 'title' in subtask and 'description' in subtask:
                                    # Ensure all required fields exist with defaults
                                    validated_subtask = {
                                        'title': str(subtask.get('title', 'Untitled Subtask'))[:100],
                                        'description': str(subtask.get('description', '')),
                                        'priority': subtask.get('priority', 'medium') if subtask.get('priority') in ['low', 'medium', 'high', 'urgent'] else 'medium'
                                    }
                                    validated_subtasks.append(validated_subtask)

                            return validated_subtasks[:8]  # Limit to 8 subtasks max

                    except json.JSONDecodeError:
                        logger.error(f"Failed to parse Claude response as JSON: {response_text}")
                        return []
            else:
                logger.error(f"Claude API error {response.status_code} during task breakdown")

            return []

        except requests.exceptions.RequestException as e:
            logger.error(f"Claude API request error during task breakdown: {str(e)}")
            return []

        except Exception as e:
            logger.error(f"Unexpected error in task breakdown: {str(e)}")
            return []


def get_claude_service(user=None):
    """
    Factory function to get a Claude service instance for a specific user
    """
    return ClaudeAIService(user=user)