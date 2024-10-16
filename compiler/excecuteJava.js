const executeJava = (filepath) => {
    const jobId = path.basename(filepath).split(".")[0];
    const outPath = path.join(outputPath, jobId);

    return new Promise((resolve, reject) => {
        exec(
            `javac "${filepath}" -d "${outputPath}" && cd "${outputPath}" && java ${jobId}`,
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
