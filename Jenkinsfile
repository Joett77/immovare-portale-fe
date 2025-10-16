#!/usr/bin/env groovy

def FAILED_STAGE = ''
def SLACK_MSG = ''

pipeline {
    agent {
        node {
      label 'immovare-fe-builds'
        }
    }

    options {
        timeout(time: 1, unit: 'HOURS')
    		buildDiscarder(logRotator(numToKeepStr: '3', artifactNumToKeepStr: '3'))
    }

    environment {
        PROTRACTOR_CHROME_VERS = '83.0.4103.61'
        DOCKER_REPOSITORY_CREDENTIAL = 'nexus'
        DOCKER_IMAGE_NAME = 'pwb-frontend'
        PROJECT_VERSION = ''
        PROJECT_VERSION_PROD = ''
        customImage = ''
    }

    stages {
        stage('Install') {
      steps {
        echo 'Installing..'
        //sh 'npm run ng -- --version'
        sh 'node --version'
        sh 'npm --version'
        sh 'npm cache clean --force'
        sh 'npm install --force'
        echo "current build: $currentBuild"
      }
        }
        stage('Extract Project version') {
      steps {
        script {
          PROJECT_VERSION = sh(returnStdout: true, script: 'npm run get-version --silent').trim()
          PROJECT_VERSION_PROD = PROJECT_VERSION + "-PROD"
          echo "Project version ${PROJECT_VERSION}"
        }
      }
        }
        stage('Build') {
          steps {
            script {
              sh 'npm run build-stg'
            }
          }
        }

    	stage('Build docker image') {
			steps{
				echo "Building ${DOCKER_IMAGE_NAME}:${PROJECT_VERSION}"
			  	script{
			        try {
                REPO = "${env.DOCKER_REPOSITORY_DNS}".replace("https://", "")
                sh "img build -t ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION} ."
			        } catch (err) {
			            SLACK_MSG = "Stage: Build docker image, \nError: " + err.getMessage()
			            error SLACK_MSG
			        }
	      		}
	      	}
	    }

        stage('Build Prod') {
          steps {
            script {
              sh 'npm run build-prod'
            }
          }
        }

    	stage('Build docker image Prod') {
			steps{
				echo "Building ${DOCKER_IMAGE_NAME}:${PROJECT_VERSION_PROD}"
			  	script{
			        try {
                REPO = "${env.DOCKER_REPOSITORY_DNS}".replace("https://", "")
                sh "img build -t ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION_PROD} ."
			        } catch (err) {
			            SLACK_MSG = "Stage: Build docker image, \nError: " + err.getMessage()
			            error SLACK_MSG
			        }
	      		}
	      	}
	    }

	    stage('Push docker image') {
		  steps{
		  	script{
		  		try {
					REPO = "${env.DOCKER_REPOSITORY_DNS}".replace("https://", "")
					sh "img push ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION}"
			     } catch (err) {
		            SLACK_MSG = "Stage: Push docker image, \nError: " + err.getMessage()
		            error SLACK_MSG
		        }
	      	}
		  }
		}

	    stage('Push docker image Prod') {
		  steps{
		  	script{
		  		try {
					REPO = "${env.DOCKER_REPOSITORY_DNS}".replace("https://", "")
					sh "img push ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION_PROD}"
			     } catch (err) {
		            SLACK_MSG = "Stage: Push docker image, \nError: " + err.getMessage()
		            error SLACK_MSG
		        }
	      	}
		  }
		}

		stage('Push docker image in "latest" tag version') {
			steps{
				script{
					REPO = "${env.DOCKER_REPOSITORY_DNS}".replace("https://", "")
					sh "img tag ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION} ${REPO}${DOCKER_IMAGE_NAME}:latest"
					sh "img push ${REPO}${DOCKER_IMAGE_NAME}:latest"
				}
			}
		}
        }

    post {
        always {
          deleteDir() /* clean up our workspace */
        }
        success {
          echo 'Build succeeded!'
          sh "img rm ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION}"
          sh "img rm ${REPO}${DOCKER_IMAGE_NAME}:${PROJECT_VERSION_PROD}"
          sh "img rm ${REPO}${DOCKER_IMAGE_NAME}:latest"
        }
        unstable {
          slackSend color: 'warning', message: "Build #$BUILD_ID - $JOB_NAME , unstable"
        }
        changed {
          script {
            echo "$JOB_NAME"
            def color = 'warning'
            def fail_stage_msg = ''
            if (currentBuild.result == 'SUCCESS') {
              color = 'good'
            }
            if (currentBuild.result == 'FAILURE') {
              color = 'danger'
              fail_stage_msg = 'on stage ${FAILED_STAGE}'
            }
            slackSend color: color, message: "Build <${env.BUILD_URL}|#$BUILD_ID - $JOB_NAME>' \nchanged job status to $currentBuild.result ${fail_stage_msg}.\n ${SLACK_MSG} \n"
          }
        }
    }
    }
