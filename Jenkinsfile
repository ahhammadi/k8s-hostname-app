def updateHelmcharts(String path){
    if (!fileExists("${path}/${env.TAG_NAME}")) {
        def source = "${path}/Source"
        def dest = "${path}/${env.TAG_NAME}"

        sh " cp -a -r ${source} ${dest}"
        def valueData = readYaml(file: "${dest}/values.yaml");
        valueData.image.tag = "${env.TAG_NAME}"
        sh "rm -f ${dest}/values.yaml"
        writeYaml(file: "${dest}/values.yaml", data: valueData)

        def chartData = readYaml(file: "${dest}/Chart.yaml");
        chartData.version = VERSION
        valueData.appVersion = VERSION
        sh "rm -f ${dest}/Chart.yaml"
        writeYaml(file: "${dest}/Chart.yaml", data: chartData)
    }
}
pipeline {

    environment {
        HOME = "${WORKSPACE}"
        NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    }
    agent any
    stages {
        // build  app / tests
        stage("Build app") {  
            agent {
                dockerfile {
                    filename 'Dockerfile-nest-cli'
                    dir '.docker'
                    reuseNode true
                }
            }
            steps {
                echo 'Build app stage';
                 dir("./") {
                     script {
                        if (env.TAG_NAME != null) {
                            def packageJSON = readJSON file: 'package.json'
                            packageJSON.version = env.TAG_NAME.replace('v', '');
                            writeJSON file: 'package.json', json: packageJSON
                        }
                        sh 'npm install'
                        sh 'npm run build'
                        sh 'rm -rf dist'
                        sh 'rm -rf node_modules'
                    }
                 }
                
            }
        }
        // Build docker image
        stage('Build docker') {
            steps {
                dir("./"){
                    script {
                        def imageTag = "${env.TAG_NAME}";
                        docker.build("docker push ahhammadi/k8s-hostname:${imageTag}", "-f ./Dockerfile .").push()
                    }
                }
            }
        }
        stage('update helm charts') {
            when {
                expression {
                    env.TAG_NAME != null
                }
            }
            steps {
                script {
                    cleanWs()
                    def VERSION = env.TAG_NAME.replace('v', '');
                    git 'https://github.com/ahhammadi/k8s-hostname-charts.git'
                    updateHelmcharts("${WORKSPACE}/charts");
                    sh "git config --global user.email ah_hammadi@hotmail.com"
                    sh "git config --global user.name Hammadi}"
                    sh("git add . && git commit -m 'Jenkins: bump helm charts  version to ${env.TAG_NAME}' && git push -u origin master")
                }
            }
        }
    }
}