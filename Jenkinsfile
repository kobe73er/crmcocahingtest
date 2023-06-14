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


        stage('Update Helm Chart Version') {
                steps {
                    container('docker') {
                        // 省略部分代码...
                        sh '''
                        currentAppVersion=$(cat Chart.yaml | grep appVersion | awk '{print \$2}' | tr -d '\r')"
                        // 计算新的 appVersion
                        newAppVersion=${scmVars.GIT_COMMIT}// 根据需要计算新的 appVersion

                        // 更新 Chart.yaml 文件中的 appVersion
                        sed -i 's/appVersion: \${currentAppVersion}/appVersion: \${newAppVersion}/' Chart.yaml

                        // 提交更新的 Chart.yaml 文件到 GitHub 存储库
                        git add Chart.yaml
                        git commit -m 'Update appVersion in Chart.yaml'
                        git push origin master
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




