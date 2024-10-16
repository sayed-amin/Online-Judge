const executePython = (filepath) => {
    return new Promise((resolve, reject) => {
        exec(`python "${filepath}"`, (error, stdout, stderr) => {
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
