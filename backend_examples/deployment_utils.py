"""
Deployment utilities for validating and processing deployment page data.

This module provides helper functions for:
- Validating deployment steps
- Checking step progression
- Calculating progress
- Initializing default steps
"""

import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime


# Default deployment steps
DEFAULT_DEPLOYMENT_STEPS = [
    {
        "id": "hardware_delivery",
        "name": "Hardware Delivery",
        "status": "pending",
        "estimatedHours": 4
    },
    {
        "id": "software_installation",
        "name": "Software Installation",
        "status": "pending",
        "estimatedHours": 8
    },
    {
        "id": "network_setup",
        "name": "Network Setup",
        "status": "pending",
        "estimatedHours": 6
    },
    {
        "id": "system_testing",
        "name": "System Testing",
        "status": "pending",
        "estimatedHours": 4
    }
]

# Expected step order
STEP_ORDER = [
    "hardware_delivery",
    "software_installation",
    "network_setup",
    "system_testing"
]

# Valid step statuses
VALID_STATUSES = ["pending", "in_progress", "completed", "blocked"]


def get_default_steps() -> List[Dict[str, Any]]:
    """Returns the default deployment steps."""
    return DEFAULT_DEPLOYMENT_STEPS.copy()


def initialize_steps_if_empty(steps_value: Optional[str]) -> str:
    """
    Initialize steps with default values if empty or missing.
    
    Args:
        steps_value: The current steps field value (JSON string or None)
    
    Returns:
        JSON string of steps (default if empty, original if valid)
    """
    if not steps_value or steps_value.strip() == "" or steps_value == "[]":
        return json.dumps(DEFAULT_DEPLOYMENT_STEPS)
    
    try:
        # Validate that it's valid JSON
        parsed = json.loads(steps_value)
        if not isinstance(parsed, list):
            return json.dumps(DEFAULT_DEPLOYMENT_STEPS)
        if len(parsed) == 0:
            return json.dumps(DEFAULT_DEPLOYMENT_STEPS)
        return steps_value
    except (json.JSONDecodeError, TypeError):
        return json.dumps(DEFAULT_DEPLOYMENT_STEPS)


def validate_step(step: Dict[str, Any], step_index: int) -> Tuple[bool, Optional[str]]:
    """
    Validate a single deployment step.
    
    Args:
        step: Step dictionary
        step_index: Index of step in the steps array
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Required fields
    required_fields = ["id", "name", "status", "estimatedHours"]
    for field in required_fields:
        if field not in step:
            return False, f"Step missing required field: {field}"
    
    # Validate status
    if step["status"] not in VALID_STATUSES:
        return False, f"Invalid status: {step['status']}. Must be one of {VALID_STATUSES}"
    
    # Validate estimatedHours
    try:
        estimated_hours = float(step["estimatedHours"])
        if estimated_hours <= 0:
            return False, "estimatedHours must be a positive number"
    except (ValueError, TypeError):
        return False, "estimatedHours must be a number"
    
    # Validate actualHours if provided
    if "actualHours" in step and step["actualHours"] is not None:
        try:
            actual_hours = float(step["actualHours"])
            if actual_hours < 0:
                return False, "actualHours must be a non-negative number"
        except (ValueError, TypeError):
            return False, "actualHours must be a number"
    
    # Validate completedAt if provided
    if "completedAt" in step and step["completedAt"]:
        try:
            datetime.fromisoformat(step["completedAt"].replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return False, "completedAt must be a valid ISO date string"
    
    # Hardware delivery requires receipt when completed
    if step["id"] == "hardware_delivery" and step["status"] == "completed":
        if not step.get("deliveryReceipt"):
            return False, "hardware_delivery step requires deliveryReceipt when status is 'completed'"
    
    return True, None


def validate_step_progression(steps: List[Dict[str, Any]]) -> Tuple[bool, Optional[str]]:
    """
    Validate that steps are completed in the correct order.
    
    Args:
        steps: List of step dictionaries
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Create a map of step ID to index in STEP_ORDER
    step_order_map = {step_id: idx for idx, step_id in enumerate(STEP_ORDER)}
    
    # Track which steps are completed
    completed_steps = []
    
    for step in steps:
        step_id = step.get("id")
        status = step.get("status")
        
        if step_id not in step_order_map:
            # Unknown step ID, skip progression check
            continue
        
        step_index = step_order_map[step_id]
        
        # Check if step can be in_progress or completed
        if status in ["in_progress", "completed"]:
            # Check if previous steps are completed
            for prev_step_id in STEP_ORDER[:step_index]:
                if prev_step_id not in completed_steps:
                    prev_step = next((s for s in steps if s.get("id") == prev_step_id), None)
                    if prev_step and prev_step.get("status") != "completed":
                        prev_step_name = prev_step.get("name", prev_step_id)
                        current_step_name = step.get("name", step_id)
                        return False, (
                            f"Step progression error: Cannot mark '{current_step_name}' as {status} "
                            f"before '{prev_step_name}' is completed"
                        )
        
        if status == "completed":
            completed_steps.append(step_id)
    
    return True, None


def validate_steps(steps_value: str) -> Tuple[bool, Optional[str], Optional[List[Dict[str, Any]]]]:
    """
    Validate the steps field value.
    
    Args:
        steps_value: JSON string of steps array
    
    Returns:
        Tuple of (is_valid, error_message, parsed_steps)
    """
    try:
        steps = json.loads(steps_value)
    except json.JSONDecodeError:
        return False, "Invalid steps field: must be a valid JSON array", None
    
    if not isinstance(steps, list):
        return False, "Invalid steps field: must be a JSON array", None
    
    # Validate each step
    for idx, step in enumerate(steps):
        if not isinstance(step, dict):
            return False, f"Invalid step at index {idx}: must be an object", None
        
        is_valid, error = validate_step(step, idx)
        if not is_valid:
            return False, error, None
    
    # Validate step progression
    is_valid, error = validate_step_progression(steps)
    if not is_valid:
        return False, error, None
    
    return True, None, steps


def calculate_progress(steps: List[Dict[str, Any]]) -> int:
    """
    Calculate deployment progress percentage.
    
    Args:
        steps: List of step dictionaries
    
    Returns:
        Progress percentage (0-100)
    """
    if not steps or len(steps) == 0:
        return 0
    
    completed_count = sum(1 for step in steps if step.get("status") == "completed")
    total_count = len(steps)
    
    if total_count == 0:
        return 0
    
    progress = int((completed_count / total_count) * 100)
    return min(100, max(0, progress))  # Ensure between 0-100


def are_all_steps_completed(steps: List[Dict[str, Any]]) -> bool:
    """
    Check if all deployment steps are completed.
    
    Args:
        steps: List of step dictionaries
    
    Returns:
        True if all steps are completed, False otherwise
    """
    if not steps or len(steps) == 0:
        return False
    
    return all(step.get("status") == "completed" for step in steps)


def validate_installation_field(field_name: str, field_value: str, existing_data: Dict[str, str]) -> Tuple[bool, Optional[str]]:
    """
    Validate installation section fields.
    
    Args:
        field_name: Name of the field
        field_value: Value of the field
        existing_data: Dictionary of existing field values
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if field_name == "deployment_engineer":
        if len(field_value) > 255:
            return False, "deployment_engineer must be 255 characters or less"
    
    elif field_name == "start_date":
        if field_value:
            try:
                datetime.strptime(field_value, "%Y-%m-%d")
            except ValueError:
                return False, "start_date must be in YYYY-MM-DD format"
    
    elif field_name == "target_date":
        if field_value:
            try:
                datetime.strptime(field_value, "%Y-%m-%d")
            except ValueError:
                return False, "target_date must be in YYYY-MM-DD format"
            
            # Check if target_date is after start_date
            if existing_data.get("start_date"):
                try:
                    start_date = datetime.strptime(existing_data["start_date"], "%Y-%m-%d")
                    target_date = datetime.strptime(field_value, "%Y-%m-%d")
                    if target_date < start_date:
                        return False, "target_date must be after start_date"
                except ValueError:
                    pass  # Already validated above
    
    elif field_name == "progress":
        try:
            progress = float(field_value)
            if progress < 0 or progress > 100:
                return False, "progress must be between 0 and 100"
        except (ValueError, TypeError):
            return False, "progress must be a number"
    
    return True, None


def validate_notes(notes_value: str) -> Tuple[bool, Optional[str]]:
    """
    Validate the notes field value.
    
    Args:
        notes_value: JSON string of notes array
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        notes = json.loads(notes_value)
    except json.JSONDecodeError:
        return False, "Invalid notes field: must be a valid JSON array"
    
    if not isinstance(notes, list):
        return False, "Invalid notes field: must be a JSON array"
    
    required_fields = ["id", "author", "content", "timestamp"]
    for idx, note in enumerate(notes):
        if not isinstance(note, dict):
            return False, f"Invalid note at index {idx}: must be an object"
        
        for field in required_fields:
            if field not in note:
                return False, f"Note missing required field: {field}"
        
        # Validate timestamp
        try:
            datetime.fromisoformat(note["timestamp"].replace("Z", "+00:00"))
        except (ValueError, AttributeError, KeyError):
            return False, f"Note at index {idx}: timestamp must be a valid ISO date string"
    
    return True, None

