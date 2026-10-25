pipeline {
    agent any

    stages {

        // ================= CHECKOUT =================
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        // ================= BACKEND CI =================
        stage('Backend - Clean') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn clean'
                }
            }
        }

        stage('Backend - Validate') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn validate'
                }
            }
        }

        stage('Backend - Initialize') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn initialize'
                }
            }
        }

        stage('Backend - Compile') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn compile'
                }
            }
        }

        stage('Backend - Test Compile') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn test-compile'
                }
            }
        }

        stage('Backend - Unit Tests') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn test'
                }
            }
        }

        stage('Backend - Integration Tests') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn integration-test'
                }
            }
        }

        stage('Backend - Install') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn install'
                }
            }
        }

        stage('Backend - Verify') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn verify'
                }
            }
        }

        stage('Backend - Package') {
            steps {
                dir('urlshort/urlshort') {
                    bat 'mvn package -DskipTests'
                }
            }
        }

        // ================= FRONTEND CI =================
        stage('Frontend - Install Dependencies') {
            steps {
                dir('frontend/urlshortfe') {
                    bat 'npm ci'
                }
            }
        }

        stage('Frontend - Lint') {
            steps {
                dir('frontend/urlshortfe') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend/urlshortfe') {
                    bat 'npm run build'
                }
            }
        }

        // ================= DOCKER VERIFICATION =================
        stage('Docker - Verify Backend Image') {
            steps {
                bat 'docker pull guywhobuildsandtests/urlshortbe:latest'
            }
        }

        stage('Docker - Verify Frontend Image') {
            steps {
                bat 'docker pull guywhobuildsandtests/urlshortfe:latest'
            }
        }
    }

    post {
        always {
            echo 'CI Pipeline run completed.'
        }

        success {
            echo 'All Backend, Frontend, and Docker verification stages passed!'
        }

        failure {
            echo 'Pipeline failed! Check the failed stage in Jenkins Console Output.'
        }
    }
}
