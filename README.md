# Docker-Oriented Cluster Template

This repository aims as a basis to kickstart on managing a docker-oriented cluster.
A Docker-oriented cluster is a cluster of docker-oriented services.
It is very similar to docker compose, but have a more flexible approach to set up each of the components, or services, through Node JS and NPM.
Each docker-oriented services should have an NPM `serve` run command that compiles and upload its distributables to docker.
A docker-oriented cluster keeps track on the version of the service under the `./services` directory via `git` while activate all the services with NPM `serve` run command.
