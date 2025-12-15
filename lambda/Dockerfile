FROM public.ecr.aws/lambda/python:3.14

# Copy requirements first (better caching)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy function code and all modules
COPY lambda_function.py .
COPY ai/ ./ai/
COPY lib/ ./lib/
COPY repositories/ ./repositories/

# Lambda handler
CMD ["lambda_function.lambda_handler"]