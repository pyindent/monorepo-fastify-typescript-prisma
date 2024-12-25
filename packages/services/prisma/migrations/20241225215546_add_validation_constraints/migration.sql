ALTER TABLE "UserFastify"
ADD CONSTRAINT check_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_password_length CHECK (char_length(password) >= 6 AND char_length(password) <= 100);

ALTER TABLE "PostFastify"
ADD CONSTRAINT check_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
ADD CONSTRAINT check_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500);