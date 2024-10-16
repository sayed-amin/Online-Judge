const executeGo = (filepath) => {
    const jobId = path.basename(filepath).split(".")[0];

    return new Promise((resolve, reject) => {
        exec(
            `go run "${filepath}"`,
            (error, stdout, stderr) => {
                if (error) {
                    return reject({ error: error.message, stderr });
                }
                if (stderr) {
                    return reject(stderr);
                }
                resolve(stdout);
            }
        );
    });
};
