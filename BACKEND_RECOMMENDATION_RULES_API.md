# Backend Recommendation Rules API Implementation

## Problem
The frontend is calling `/api/platform/recommendation-rules` but the hardware list is not populating. This endpoint needs to be implemented on the backend.

## Required Endpoint

### GET `/api/platform/recommendation-rules`

**Purpose:** Fetch recommendation rules that link software categories to hardware categories

**Query Parameters:**
- `category_ids` (optional): Comma-separated list of software category IDs (e.g., `?category_ids=1,2,3`)

**Request Example:**
```
GET /api/platform/recommendation-rules?category_ids=1,2,3
```

**Response Format:**
```json
{
  "message": "Successfully fetched recommendation rules",
  "data": [
    {
      "id": "1",
      "software_category": "1",
      "hardware_category": "1",
      "is_mandatory": true,
      "quantity": 2,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    },
    {
      "id": "2",
      "software_category": "1",
      "hardware_category": "2",
      "is_mandatory": true,
      "quantity": 1,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

## Database Schema

The `recommendation_rules` table has these columns:
- `id` (INT, PRIMARY KEY)
- `software_category_id` (INT, FOREIGN KEY → software_categories.id)
- `hardware_category_id` (INT, FOREIGN KEY → hardware_categories.id)
- `is_mandatory` (BOOLEAN)
- `quantity` (INT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Implementation Notes

### 1. Column Name Mapping
The database uses `software_category_id` and `hardware_category_id`, but the API response should use `software_category` and `hardware_category` (without `_id` suffix).

**Mapping:**
- `software_category_id` → `software_category` (in response)
- `hardware_category_id` → `hardware_category` (in response)

### 2. Query Parameter Handling
- If `category_ids` is provided, filter rules where `software_category_id IN (category_ids)`
- If `category_ids` is not provided, return all recommendation rules
- Parse comma-separated IDs: `"1,2,3"` → `[1, 2, 3]`

### 3. SQL Query Example

**With category_ids filter:**
```sql
SELECT 
    id,
    software_category_id AS software_category,
    hardware_category_id AS hardware_category,
    is_mandatory,
    quantity,
    created_at,
    updated_at
FROM recommendation_rules
WHERE software_category_id IN (1, 2, 3)
ORDER BY software_category_id, is_mandatory DESC, hardware_category_id;
```

**Without filter (all rules):**
```sql
SELECT 
    id,
    software_category_id AS software_category,
    hardware_category_id AS hardware_category,
    is_mandatory,
    quantity,
    created_at,
    updated_at
FROM recommendation_rules
ORDER BY software_category_id, is_mandatory DESC, hardware_category_id;
```

### 4. Python/Flask Implementation Example

```python
@platform_bp.route('/recommendation-rules', methods=['GET'])
def get_recommendation_rules():
    """
    Get recommendation rules
    Query params: category_ids (optional, comma-separated)
    """
    try:
        category_ids_param = request.args.get('category_ids')
        
        query = db.session.query(RecommendationRule)
        
        if category_ids_param:
            # Parse comma-separated category IDs
            category_ids = [int(id.strip()) for id in category_ids_param.split(',') if id.strip()]
            if category_ids:
                query = query.filter(RecommendationRule.software_category_id.in_(category_ids))
        
        rules = query.order_by(
            RecommendationRule.software_category_id,
            RecommendationRule.is_mandatory.desc(),
            RecommendationRule.hardware_category_id
        ).all()
        
        # Format response
        rules_data = [{
            'id': str(rule.id),
            'software_category': str(rule.software_category_id),
            'hardware_category': str(rule.hardware_category_id),
            'is_mandatory': rule.is_mandatory,
            'quantity': rule.quantity,
            'created_at': rule.created_at.isoformat() if rule.created_at else None,
            'updated_at': rule.updated_at.isoformat() if rule.updated_at else None
        } for rule in rules]
        
        return jsonify({
            'message': 'Successfully fetched recommendation rules',
            'data': rules_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': f'Error fetching recommendation rules: {str(e)}'
        }), 500
```

### 5. SQLAlchemy Model Example

```python
class RecommendationRule(db.Model):
    __tablename__ = 'recommendation_rules'
    
    id = db.Column(db.Integer, primary_key=True)
    software_category_id = db.Column(db.Integer, db.ForeignKey('software_categories.id'), nullable=False)
    hardware_category_id = db.Column(db.Integer, db.ForeignKey('hardware_categories.id'), nullable=False)
    is_mandatory = db.Column(db.Boolean, default=False, nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    software_category = db.relationship('SoftwareCategory', backref='recommendation_rules')
    hardware_category = db.relationship('HardwareCategory', backref='recommendation_rules')
```

## Testing

### Test Case 1: Get all recommendation rules
```bash
GET /api/platform/recommendation-rules
```

**Expected:** Returns all recommendation rules from the database

### Test Case 2: Get rules for specific categories
```bash
GET /api/platform/recommendation-rules?category_ids=1,2
```

**Expected:** Returns only rules where `software_category_id` is 1 or 2

### Test Case 3: Get rules for single category
```bash
GET /api/platform/recommendation-rules?category_ids=1
```

**Expected:** Returns only rules where `software_category_id` is 1

### Test Case 4: No rules found
```bash
GET /api/platform/recommendation-rules?category_ids=999
```

**Expected:** Returns empty array `[]`

## Verification

After implementing, verify:
1. ✅ Endpoint returns 200 status code
2. ✅ Response has `message` and `data` fields
3. ✅ `data` is an array
4. ✅ Each rule has `id`, `software_category`, `hardware_category`, `is_mandatory`, `quantity`
5. ✅ Filtering by `category_ids` works correctly
6. ✅ Column names are mapped correctly (`software_category_id` → `software_category`)

## Frontend Integration

The frontend is already calling this endpoint:
- **Service:** `PlatformConfigService.getRecommendationRules(categories: string[])`
- **Endpoint:** `/platform/recommendation-rules?category_ids=1,2,3`
- **Usage:** Called in `ScopingStep.tsx` when software modules are loaded

Once this endpoint is implemented, the hardware list should populate correctly when software items are selected.

## Troubleshooting

If hardware still doesn't populate after implementing the endpoint:

1. **Check browser console:**
   - Look for "📋 Recommendation rules fetched" log
   - Check for any API errors

2. **Verify database:**
   - Ensure `recommendation_rules` table has data
   - Verify `software_category_id` and `hardware_category_id` match existing categories

3. **Check API response:**
   - Use browser DevTools Network tab
   - Verify response format matches expected structure
   - Check that IDs are returned as strings (not integers)

4. **Verify category IDs:**
   - Ensure software modules have valid `category_id` values
   - Ensure recommendation rules reference valid category IDs

