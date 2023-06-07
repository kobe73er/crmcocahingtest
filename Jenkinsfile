def scmVars
pipeline {
    environment {
        DOCKER_KEY = credentials('acrtoken')
    }

    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                metadata:
                  name: jenkins-agent
                  namespace: devstack
                spec:
                  containers:
                  - name: docker
                    image: docker:dind
                    securityContext:
                      privileged: true
                    volumeMounts:
                      - name: docker-socket
                        mountPath: /var/run/docker-host.sock
                  volumes:
                    - name: docker-socket
                      hostPath:
                        path: /var/run/docker.sock
               '''
        }
    }

    stages {

        stage('Clone') {
            steps {
                container('docker') {
                    script {
                          scmVars = checkout([$class: 'GitSCM',
                              branches: [[name: 'master']],
                              userRemoteConfigs: [[url: 'git@github.com:kobe73er/crmcocahingtest.git']]
                          ])


                          def commitHash = scmVars.GIT_COMMIT
                          echo "Commit Hash: ${commitHash}"
                    }
                }
            }
        }

        stage('Build-Docker-Image') {
            steps {
                container('docker') {
                    sh '''
                    docker build -t fastapi:''' + scmVars.GIT_COMMIT + ''' .
                    '''
                }
            }
        }

        stage('Login-Into-Docker') {
            steps {
                container('docker') {
                    sh '''
                    echo "${DOCKER_KEY}" | docker login omsdevops.azurecr.io --username 00000000-0000-0000-0000-000000000000 --password-stdin
                    '''
                }
            }
        }

        stage('Build-Tag') {
            steps {
                container('docker') {
                    sh '''
                    docker tag fastapi:''' + scmVars.GIT_COMMIT + ''' omsdevops.azurecr.io/fastapi:''' + scmVars.GIT_COMMIT + '''
                    docker tag fastapi:''' + scmVars.GIT_COMMIT + ''' omsdevops.azurecr.io/fastapi:latest
                    '''
                }
            }
        }

        stage('Push-Images-Docker-to-DockerHub') {
            steps {
                container('docker') {
                    sh '''
                    docker push omsdevops.azurecr.io/fastapi:''' + scmVars.GIT_COMMIT + '''
                    docker push omsdevops.azurecr.io/fastapi:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            container('docker') {
                sh 'docker logout'
            }
        }
    }
}
