-- Test if tool_consumable_map is actually getting data
SELECT COUNT(*) as total_relationships FROM tool_consumable_map;
SELECT tool_code, COUNT(*) as consumable_count 
FROM tool_consumable_map 
GROUP BY tool_code 
ORDER BY consumable_count DESC 
LIMIT 5;
