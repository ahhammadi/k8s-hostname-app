def updateHelmcharts(String path){
    if (!fileExists("${path}/${VERSION}")) {
        def source = "${path}/Source"
        def dest = "${path}/${VERSION}"

        sh " cp -a -r ${source} ${dest}"
        def valueData = readYaml(file: "${dest}/values.yaml");
        valueData.image.tag = "${VERSION}"
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
        VERSION = "0.0.0"
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
                        //docker hub url is registry_url = "https://index.docker.io/v1/" 
                        // it is the defult url we don't need to set it for docker hub repo
                        withDockerRegistry(credentialsId: 'Hammadi_Docker_Credentials') {
                            if (env.BRANCH_NAME =="master") {
                            def packageJSON = readJSON file: 'package.json'
                            VERSION = packageJSON.version ;
                            writeJSON file: 'package.json', json: packageJSON
                        }
                            def imageTag = VERSION;
                            docker.build("ahhammadi/k8s-hostname:${imageTag}", "-f ./Dockerfile .").push()
                        }
                    }
                }
            }
        }
        stage('update helm charts') {
            when {
                expression {
                    env.BRANCH_NAME == 'master'
                }
            }
            steps {
                script {
                    cleanWs()
                    //def VERSION = "1.1.0";
                    sh 'git clone https://github.com/ahhammadi/k8s-hostname-charts.git'
                    updateHelmcharts("${WORKSPACE}/charts");
                    sh "git config --global user.email ah_hammadi@hotmail.com"
                    sh "git config --global user.name Hammadi}"
                    sh("git add . && git commit -m 'Jenkins: bump helm charts  version to ${VERSION}' && git push -u origin master")
                }
            }
        }
        // deploy  helm chart
        stage("deploy  helm chart") {  
            agent {
                node {
                        label 'kubepods' 
                     }
            }
             when {
                expression {
                    env.BRANCH_NAME == 'master'
                }
            }
            steps {
                echo 'deploy  helm chart';
                sh "helm upgrade k8s-hostname  -n k8s-hostname"
            }
        }
    }
}