def scmVars
pipeline {
    environment {
        DOCKER_KEY = credentials('ecr_token')
        K8S_KUBECONFIG = 'k8s-dev'
        AWS_REGION = 'us-east-2'
    }

    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                metadata:
                  name: jenkins-agent
                  namespace: jenkins
                spec:
                  containers:
                  - name: kubectl
                    image: bitnami/kubectl
                    command: ["/bin/sh", "-c", "while true; do sleep 30; done"]
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
                              userRemoteConfigs: [[url: 'https://github.com/kobe73er/crmcocahingtest.git']]
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
                    docker build -t nestjs-docker:''' + scmVars.GIT_COMMIT + ''' .
                    '''
                }
            }
        }

        stage('Login-Into-Docker') {
            steps {
                withCredentials([string(credentialsId: 'aws-cli-credentials', variable: 'AWS_CLI_CREDENTIALS')]) {
                    container('docker') {
                        sh '''
                        export AWS_ACCESS_KEY_ID=$(echo ${AWS_CLI_CREDENTIALS} | cut -d':' -f1)
                        export AWS_SECRET_ACCESS_KEY=$(echo ${AWS_CLI_CREDENTIALS} | cut -d':' -f2)
                        export AWS_DEFAULT_REGION=${AWS_REGION}

                        aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin 114018177393.dkr.ecr.us-east-2.amazonaws.com
                        '''
                    }
                }
            }
        }


        stage('Build-Tag') {
            steps {
                container('docker') {
                    sh '''
                    docker tag nestjs-docker:''' + scmVars.GIT_COMMIT + ''' 114018177393.dkr.ecr.us-east-2.amazonaws.com/nestjs-docker:''' + scmVars.GIT_COMMIT + '''
                    docker tag nestjs-docker:''' + scmVars.GIT_COMMIT + ''' 114018177393.dkr.ecr.us-east-2.amazonaws.com/nestjs-docker:latest
                    '''
                }
            }
        }

        stage('Push-Images-Docker-to-AWS-ECR') {
            steps {
                container('docker') {
                    sh '''
                    docker push 114018177393.dkr.ecr.us-east-2.amazonaws.com/nestjs-docker:''' + scmVars.GIT_COMMIT + '''
                    docker push 114018177393.dkr.ecr.us-east-2.amazonaws.com/nestjs-docker:latest
                    '''
                }
            }
        }

           stage('Helm-Upgrade') {
                    steps {
                        container('kubectl') {
                          withCredentials([file(credentialsId: "${K8S_KUBECONFIG}", variable: 'K8S_PRD')]) {
                            sh '''
                              cd helmChart
                              helm upgrade --install nestjd-demo-chart ./ --values ./values.yaml --recreate-pods --kubeconfig $K8S_PRD --wait=true --namespace backend
                            '''
                        }
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




