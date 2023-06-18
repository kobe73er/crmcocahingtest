def scmVars

pipeline {
    environment {
        DOCKER_KEY = credentials('ecr_token')
        K8S_KUBECONFIG = 'k8s-dev'
        AWS_REGION = 'us-east-2'
        AWS_ACCOUNT_ID = '114018177393'
        SLACK_CHANNEL = "#jenkins-job-notification"
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


        stage('Login-AWS') {
            steps {
                container('docker') {
                    sh '''
                       export AWS_ACCESS_KEY_ID=AKIARVDADKFYUAZFZ5EV
                       export AWS_SECRET_ACCESS_KEY=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
                       
                       apk add --no-cache python3 py3-pip && \\
                       pip3 install --upgrade pip && \\
                       pip3 install awscli
                       
                       aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 114018177393.dkr.ecr.us-east-2.amazonaws.com
                       '''
                }
            }
        }

        stage('Clone') {
            steps {
                container('docker') {
                    script {
                        scmVars = checkout([$class           : 'GitSCM',
                                            branches         : [[name: 'master']],
                                            userRemoteConfigs: [[url: 'https://github.com/kobe73er/crmcocahingtest.git']]
                        ])
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

        stage('Update-Helm-Chart-Version') {
            steps {
                container('docker') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'github_creds', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {

                            git url: 'https://github.com/kobe73er/helm_repo_nestjs.git', branch: 'master',
                                    credentialsId: 'github_creds'


                            sh '''
                                cd nestjs && pwd && ls
                                currentAppVersion=$(cat Chart.yaml | grep appVersion | awk '{print \$2}' | tr -d '\r')




                                newAppVersion=''' + scmVars.GIT_COMMIT + '''
                                echo $newAppVersion


                                sed "s/appVersion:.*/appVersion: $newAppVersion/" Chart.yaml > Chart.yaml.tmp
                                mv Chart.yaml.tmp Chart.yaml



                                cat Chart.yaml

                                apk add git
                                git config --global --add safe.directory /home/jenkins/agent/workspace/nestjs_demo

                                git config --global user.email "kobe73er@gmail.com"
                                git config --global user.name "kobe73er"
                                git add .
                                git commit -m 'Update appVersion in Chart.yaml'
                                git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/${GIT_USERNAME}/helm_repo_nestjs.git HEAD:master
                                '''
                        }
                    }
                }
            }
        }
    }
}




