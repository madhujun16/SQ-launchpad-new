"""
Example implementation of deployment-specific logic in page_controller.py

This shows how to integrate deployment validation and processing into the existing
page_controller.py file.
"""

from app.launchpad.launchpad_api.utils.deployment_utils import (
    initialize_steps_if_empty,
    validate_steps,
    calculate_progress,
    are_all_steps_completed,
    validate_installation_field,
    validate_notes
)
from app.launchpad.launchpad_api.db_models.site import Site


def process_deployment_page_create(page_data: dict) -> dict:
    """
    Process deployment page creation.
    Initializes default steps if steps field is empty.
    
    Args:
        page_data: Page creation data
    
    Returns:
        Modified page_data with initialized steps if needed
    """
    if page_data.get("page_name") != "deployment":
        return page_data
    
    # Find deployment_checklist section
    for section in page_data.get("sections", []):
        if section.get("section_name") == "deployment_checklist":
            # Find steps field
            for field in section.get("fields", []):
                if field.get("field_name") == "steps":
                    # Initialize with default steps if empty
                    field["field_value"] = initialize_steps_if_empty(field.get("field_value"))
                    break
    
    return page_data


def process_deployment_page_update(page_data: dict, site_id: int) -> Tuple[bool, Optional[str], Optional[dict]]:
    """
    Process deployment page update.
    Validates steps, calculates progress, and updates site status.
    
    Args:
        page_data: Page update data
        site_id: Site ID
    
    Returns:
        Tuple of (success, error_message, updated_data)
    """
    if page_data.get("page_name") != "deployment":
        return True, None, page_data
    
    updated_data = page_data.copy()
    installation_data = {}
    
    # Process each section
    for section in page_data.get("sections", []):
        section_name = section.get("section_name")
        
        if section_name == "deployment_checklist":
            # Validate steps
            for field in section.get("fields", []):
                if field.get("field_name") == "steps":
                    steps_value = field.get("field_value", "[]")
                    
                    # Initialize if empty
                    steps_value = initialize_steps_if_empty(steps_value)
                    
                    # Validate steps
                    is_valid, error, steps = validate_steps(steps_value)
                    if not is_valid:
                        return False, error, None
                    
                    # Calculate progress
                    progress = calculate_progress(steps)
                    installation_data["progress"] = str(progress)
                    
                    # Update field value
                    field["field_value"] = steps_value
                    
                    # Check if all steps are completed
                    if are_all_steps_completed(steps):
                        # Update site status to 'deployed'
                        try:
                            site = Site.query.filter_by(id=site_id).first()
                            if site:
                                site.status = "deployed"
                                # Commit will be done by the calling function
                        except Exception as e:
                            # Log error but don't fail the update
                            print(f"Error updating site status: {e}")
        
        elif section_name == "installation":
            # Validate installation fields
            for field in section.get("fields", []):
                field_name = field.get("field_name")
                field_value = field.get("field_value", "")
                
                # Collect existing data for validation
                existing_data = {}
                for existing_field in section.get("fields", []):
                    if existing_field.get("field_name") in ["start_date", "target_date"]:
                        existing_data[existing_field.get("field_name")] = existing_field.get("field_value", "")
                
                # Validate field
                is_valid, error = validate_installation_field(
                    field_name, field_value, existing_data
                )
                if not is_valid:
                    return False, error, None
        
        elif section_name == "testing":
            # Validate notes
            for field in section.get("fields", []):
                if field.get("field_name") == "notes":
                    notes_value = field.get("field_value", "[]")
                    is_valid, error = validate_notes(notes_value)
                    if not is_valid:
                        return False, error, None
    
    # Update progress in installation section if calculated
    if "progress" in installation_data:
        for section in updated_data.get("sections", []):
            if section.get("section_name") == "installation":
                # Find or create progress field
                progress_field = None
                for field in section.get("fields", []):
                    if field.get("field_name") == "progress":
                        progress_field = field
                        break
                
                if progress_field:
                    progress_field["field_value"] = installation_data["progress"]
                else:
                    # Create new progress field
                    section.setdefault("fields", []).append({
                        "field_name": "progress",
                        "field_value": installation_data["progress"]
                    })
    
    return True, None, updated_data


# Example usage in page_post() function:
"""
def page_post():
    # ... existing code ...
    
    # Process deployment page creation
    page_data = process_deployment_page_create(page_data)
    
    # ... rest of existing code ...
"""


# Example usage in page_put() function:
"""
def page_put():
    # ... existing code to get page_data and site_id ...
    
    # Process deployment page update
    success, error, updated_data = process_deployment_page_update(page_data, site_id)
    if not success:
        return {"message": error}, 400
    
    # Use updated_data instead of page_data
    page_data = updated_data
    
    # ... rest of existing code ...
"""

