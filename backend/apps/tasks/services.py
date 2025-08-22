import os
import logging
from typing import Optional
import anthropic
from django.conf import settings

logger = logging.getLogger(__name__)


class ClaudeAIService:
    """Service for interacting with Claude AI API"""
    
    def __init__(self):
        self.api_key = os.getenv('CLAUDE_API_KEY')
        if not self.api_key:
            logger.warning("CLAUDE_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=self.api_key)
    
    def is_available(self) -> bool:
        """Check if Claude API is available"""
        return self.client is not None
    
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
            return "AI service is currently unavailable. Please check your API configuration."
        
        try:
            # Construct a comprehensive prompt for Claude
            system_prompt = """You are an AI assistant for a task management application. You help users by providing practical, actionable suggestions for their tasks. Your responses should be:

1. Helpful and specific to the task context
2. Actionable with clear next steps
3. Professional but friendly in tone
4. Concise but comprehensive (aim for 2-4 sentences)
5. Focused on productivity and task completion

When users ask questions about their tasks, provide suggestions that could help them complete the task more effectively, break it down into smaller steps, identify potential challenges, or suggest resources/approaches."""

            user_prompt = f"""Task: {task_title}

Description: {task_description or "No description provided"}

User Question: {user_message}

Please provide a helpful suggestion for this task."""

            # Make API call to Claude
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",  # Using Haiku for faster, cost-effective responses
                max_tokens=300,  # Limit response length for task suggestions
                temperature=0.7,  # Balanced creativity and consistency
                system=system_prompt,
                messages=[
                    {
                        "role": "user", 
                        "content": user_prompt
                    }
                ]
            )
            
            if response.content and len(response.content) > 0:
                return response.content[0].text.strip()
            else:
                logger.error("Claude API returned empty response")
                return "I'm sorry, I couldn't generate a suggestion at this time. Please try again."
                
        except anthropic.AuthenticationError:
            logger.error("Claude API authentication failed - invalid API key")
            return "AI service authentication failed. Please check the API key configuration."
        
        except anthropic.RateLimitError:
            logger.error("Claude API rate limit exceeded")
            return "AI service is temporarily busy. Please try again in a moment."
        
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            return "AI service encountered an error. Please try again later."
        
        except Exception as e:
            logger.error(f"Unexpected error in Claude AI service: {str(e)}")
            return "An unexpected error occurred. Please try again later."


# Create a singleton instance
claude_service = ClaudeAIService()