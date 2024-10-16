const executeJavaScript = (filepath) => {
    return new Promise((resolve, reject) => {
        exec(`node "${filepath}"`, (error, stdout, stderr) => {
            if (error) {
                return reject({ error: error.message, stderr });
            }
            if (stderr) {
                return reject(stderr);
            }
            resolve(stdout);
        });
    });
};
