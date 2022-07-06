#!/bin/bash
# Script for building and working in a docker container

attach_to_container() 
{
    # Allow docker windows to show on our current X Server
    xhost + >> /dev/null

    # Start the container in case it's stopped
    docker start $CONTAINER_NAME

    # Attach a terminal into the container
    exec docker exec -it $CONTAINER_NAME bash #-c /home/docker/fyp/dev-tmux.sh
}

run_without_gpu()
{
    docker run -e DISPLAY -e TERM \
        --privileged \
        -v "/dev:/dev:rw" \
        -v "$(pwd):/home/docker/fyp:rw" \
        -v "/tmp/.X11-unix:/tmp/.X11-unix:rw" \
        --net=host \
        --name $CONTAINER_NAME \
        -d $IMAGE_NAME /usr/bin/tail -f /dev/null
}

build_image() 
{
    echo "Building docker image $IMAGE_NAME from $DOCKER_FILE"
    docker build . -t $IMAGE_NAME -f $DOCKER_FILE
}

CONTAINER_NAME=fyp
IMAGE_NAME=fyp
DOCKER_FILE=docker/Dockerfile

case "$1" in
"build")
    build_image
    ;;
"pull")
    docker pull $IMAGE_NAME
    ;;
"rm")
    docker rm -f $CONTAINER_NAME
    echo "Removed container"
    ;;
"--help")
    echo "Usage: docker/run.sh [command]
Available commands:
    run.sh
        Attach a new terminal to the container (pulling/building, creating and starting it if necessary)
    run.sh build
        Build a new image from the Dockerfile in the current directory
    run.sh rm
        Remove the current container
    run.sh --help
        Show this help message    
    "
    ;;
*) # Attach a new terminal to the container (pulling, creating and starting it if necessary)
    if [ -z "$(docker images -f reference=$IMAGE_NAME -q)" ]; then # if the image does not yet exist, pull it
        build_image
    fi
    if [ -z "$(docker ps -qa -f name=$CONTAINER_NAME)" ]; then # if container has not yet been created, create it
        echo "Initialising container"
        run_without_gpu
    fi
    attach_to_container
    ;;
esac
