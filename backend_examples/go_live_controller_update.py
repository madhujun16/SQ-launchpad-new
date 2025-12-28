"""
Example update to go_live_controller.py

Update the prerequisite check to require 'deployed' status instead of 'procurement_done'.
"""

# Example update in go_live_controller.py:

"""
def mark_site_live():
    # ... existing code to get site ...
    
    # OLD: Check if procurement is done
    # if site.status != 'procurement_done':
    #     return {"message": "Procurement must be completed before going live"}, 400
    
    # NEW: Check if deployment is complete
    if site.status != 'deployed':
        return {
            "message": "Deployment must be completed before going live. All deployment steps must be finished.",
            "error": f"Current site status: {site.status}. Required status: deployed"
        }, 400
    
    # ... rest of existing code ...
"""

