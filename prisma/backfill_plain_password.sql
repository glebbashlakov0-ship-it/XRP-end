UPDATE "User"
SET "plainPassword" = 'TEMP_PASSWORD'
WHERE "plainPassword" IS NULL;
