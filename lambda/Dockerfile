FROM public.ecr.aws/lambda/python:3.13

RUN dnf install -y tar xz && \
    curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz && \
    tar -xf /tmp/ffmpeg.tar.xz -C /tmp && \
    mv /tmp/ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ && \
    mv /tmp/ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ && \
    rm -rf /tmp/ffmpeg* && \
    dnf clean all

COPY requirements.txt ${LAMBDA_TASK_ROOT}

RUN pip install -r requirements.txt

COPY lambda_function.py ${LAMBDA_TASK_ROOT}
COPY ai/ ${LAMBDA_TASK_ROOT}/ai/
COPY lib/ ${LAMBDA_TASK_ROOT}/lib/
COPY repositories/ ${LAMBDA_TASK_ROOT}/repositories/

CMD ["lambda_function.lambda_handler"]