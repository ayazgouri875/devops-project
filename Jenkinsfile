pipeline {
    // 1. Tell Jenkins to run this on any available agent (our EC2 server)
    agent any

    // 2. Define the steps of our pipeline
    stages {
        // STAGE 1: Build the Docker Image
        stage('Build Image') {
            steps {
                // Run the docker build command inside our project folder
                sh 'docker build -t my-website-image .'
                echo 'Docker image built successfully!'
            }
        }
        
        // STAGE 2: Test the Docker Image
        stage('Test Image') {
            steps {
                // Run the new image as a container.
                // We map port 8000 on the server to port 80 inside the container.
                // (We can't use 8080 because Jenkins is already using it!)
                sh 'docker run -d -p 8000:80 --name temp-website my-website-image'
                
                // Wait 5 seconds for the container to start up
                sh 'sleep 5'
                
                // Check if the website is responding
                echo 'Testing website...'
                sh 'curl -f http://localhost:8000'
                
                echo 'Website test passed!'
            }
        }
    }
    
    // 3. This block always runs at the end, even if a stage fails
    post {
        always {
            // Clean up by stopping and removing the temporary container
            echo 'Cleaning up...'
            sh 'docker stop temp-website'
            sh 'docker rm temp-website'
        }
    }
}