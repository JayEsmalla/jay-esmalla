// One atomic operation: two tabs cannot both count the same session as new.
// All keys share a hash tag so they stay together on Redis cluster deployments.
export const heartbeatScript = `
local requests = redis.call('INCR', KEYS[4])
if requests == 1 then redis.call('EXPIRE', KEYS[4], 60) end
if requests > 60 then return {-1, -1} end

local existing = redis.call('EXISTS', KEYS[1])
if existing == 0 then
  local newVisits = redis.call('INCR', KEYS[5])
  if newVisits == 1 then redis.call('EXPIRE', KEYS[5], 3600) end
  if newVisits > 30 then return {-1, -1} end
  redis.call('INCR', KEYS[2])
end
redis.call('SET', KEYS[1], '1', 'EX', 1800)
redis.call('ZREMRANGEBYSCORE', KEYS[3], '-inf', tonumber(ARGV[1]) - 90000)
redis.call('ZADD', KEYS[3], ARGV[1], ARGV[2])
redis.call('EXPIRE', KEYS[3], 120)
return {tonumber(redis.call('GET', KEYS[2]) or '0'), redis.call('ZCARD', KEYS[3])}
`;
