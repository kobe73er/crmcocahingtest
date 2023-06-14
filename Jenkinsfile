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
              script {
                  withCredentials([usernamePassword(credentialsId: 'YOUR_GITHUB_CREDENTIALS_ID', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                      // Clone Helm Chart 仓库，并提供凭据进行身份验证
                  // Clone Helm Chart 仓库
                  git url: 'git@github.com:kobe73er/helm_repo_nestjs.git'

                      // 进入 Helm Chart 目录
                      dir('nestjs') {
                          sh "apk add git"

                          // 获取当前的 appVersion
                          def currentAppVersion = sh(returnStdout: true, script: "cat Chart.yaml | grep appVersion | awk '{print \$2}' | tr -d '\r'").trim()

                          // 计算新的 appVersion
                          def newAppVersion = scmVars.GIT_COMMIT // 根据需要计算新的 appVersion

                          // 更新 Chart.yaml 文件中的 appVersion
                          sh "sed -i 's/appVersion: ${currentAppVersion}/appVersion: ${newAppVersion}/' Chart.yaml"

                          sh "pwd && ls"

                          sh "git config --global --add safe.directory /home/jenkins/agent/workspace/nestjs_demo"
                          sh "git config --global user.email \"kobe73er@gmail.com\" "
                          sh "git config --global user.name \"kobe73er\" "

                          // 提交更新的 Chart.yaml 文件到 GitHub 存储库
                          sh "git add Chart.yaml"
                          sh "git commit -m 'Update appVersion in Chart.yaml'"
                          sh "git push origin master"
                      }
                  }
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




