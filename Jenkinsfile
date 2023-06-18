def scmVars
def commitHash
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
                  - name: git
                    image: alpine/git
                    command: ["/bin/sh", "-c", "while true; do sleep 30; done"]
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


                          commitHash = scmVars.GIT_COMMIT

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
                    container('docker') {
                        sh '''
                        echo "${DOCKER_KEY}" | docker login --username AWS --password-stdin 114018177393.dkr.ecr.us-east-2.amazonaws.com
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


        stage('Update Helm Chart Version') {
                  steps {
                      container('docker') {
                          script{
                               withCredentials([usernamePassword(credentialsId: 'github_creds', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {

                                git url: 'https://github.com/kobe73er/helm_repo_nestjs.git', branch: 'master',
                                credentialsId: 'github_creds'


                                sh '''
                                cd nestjs && pwd && ls
                                currentAppVersion=$(cat Chart.yaml | grep appVersion | awk '{print \$2}' | tr -d '\r')




                                newAppVersion='''scmVars.GIT_COMMIT'''
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




