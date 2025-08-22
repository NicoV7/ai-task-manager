/**
 * Safely extract tasks array from API response
 * Handles both paginated responses and direct arrays
 * @param {*} tasksResponse - API response that could be array, paginated object, or null/undefined
 * @returns {Array} - Always returns an array of tasks
 */
export const extractTasksFromResponse = (tasksResponse) => {
  // If response is already an array, return it
  if (Array.isArray(tasksResponse)) {
    return tasksResponse;
  }
  
  // If response has results property that's an array (paginated response)
  if (tasksResponse && Array.isArray(tasksResponse.results)) {
    return tasksResponse.results;
  }
  
  // Fallback to empty array for any other case
  return [];
};

/**
 * Filter tasks by status with safe array handling
 * @param {Array} tasks - Array of tasks
 * @param {string} status - Status to filter by
 * @returns {Array} - Filtered tasks array
 */
export const filterTasksByStatus = (tasks, status) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  return tasks.filter(task => task && task.status === status);
};

/**
 * Filter tasks by priority with safe array handling
 * @param {Array} tasks - Array of tasks
 * @param {string|string[]} priorities - Priority or array of priorities to filter by
 * @returns {Array} - Filtered tasks array
 */
export const filterTasksByPriority = (tasks, priorities) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  
  const priorityArray = Array.isArray(priorities) ? priorities : [priorities];
  return tasks.filter(task => task && priorityArray.includes(task.priority));
};

/**
 * Search tasks by title and description with safe handling
 * @param {Array} tasks - Array of tasks
 * @param {string} searchTerm - Search term
 * @returns {Array} - Filtered tasks array
 */
export const searchTasks = (tasks, searchTerm) => {
  if (!Array.isArray(tasks) || !searchTerm) {
    return Array.isArray(tasks) ? tasks : [];
  }
  
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => {
    if (!task) return false;
    const title = task.title?.toLowerCase() || '';
    const description = task.description?.toLowerCase() || '';
    return title.includes(term) || description.includes(term);
  });
};

/**
 * Safely extract tags array from API response
 * Handles both paginated responses and direct arrays  
 * @param {*} tagsResponse - API response that could be array, paginated object, or null/undefined
 * @returns {Array} - Always returns an array of tags
 */
export const extractTagsFromResponse = (tagsResponse) => {
  // If response is already an array, return it
  if (Array.isArray(tagsResponse)) {
    return tagsResponse;
  }
  
  // If response has results property that's an array (paginated response)
  if (tagsResponse && Array.isArray(tagsResponse.results)) {
    return tagsResponse.results;
  }
  
  // Fallback to empty array for any other case
  return [];
};