const axios = require('axios').default,
    fs = require('fs'),
    stream = require('stream'),
    path = require("path");

let baseurl = "http://101.46.54.71",
    api = {
        upload: "/api/v1/video/upload",
        face: "/api/v1/task/face",
        liveface: "/api/v1/task/liveface",
        stablediffusion: "/api/v1/task/stable_diffusion",
        imgtoimg: "/api/v1/task/imgtoimg",
        executTask: (task_id) => `/api/v1/task/executing/${task_id}`,
        taskResult: (task_id) => `/api/v1/task/task_result/${task_id}`,
        download: (filename) => `/api/v1/video/download/${filename}`
    };

async function postData(params) {
    try {
        let response,
            header = params.Header || {};
        response = await axios.post(
            `${baseurl}${api[params.Task]}`,
            params.BodyData,
            {
                headers: {
                    ...header,
                    'Accept': 'application/json'
                }
            }
        );
        console.log('postData Response:', params.Task, response.data);
        if (response.data) {
            return response.data;
        }
        throw response.data;
    } catch (error) {
        console.error('postData failed:', params.Task, error);
        throw error;
    }
}

async function executeTask(taskId) {
    try {
        let response = await axios.put(`${baseurl}${api.executTask(taskId)}`),
            ret = response.data;
        console.log("executeTask", ret);
        if (ret.code === 200) {
            return true;
        }
    } catch (error) {
        console.error('Error executing task:', error);
    }
    return false;
}

async function getTaskResult(taskId) {
    try {
        const response = await axios.get(`${baseurl}${api.taskResult(taskId)}`),
            ret = response.data;
            console.log("TaskResult", ret.code, ret.msg);
            if (ret.code === 200 && typeof ret.data === 'object' && ret.data !== null) {
                console.log("TaskResult", ret.data?.filename);
                return {Filename: ret.data?.filename};
            } else if (ret.code === 512) {
                return;
            } else {
                return {ErrorMsg: ret.msg};
            }
    } catch (error) {
        console.error('Error getting task result:', error);
    }
    return null;
}

async function downloadFile(filename, outputPath) {
    try {
        let url = `${baseurl}${api.download(filename)}`,
            response;
        response = await axios.post(url, null, {
            responseType: 'stream'
        });
        if (response.status === 200) {
            let writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('close', () => {
                    resolve(true);
                    console.log("下载完成!");
                });
                writer.on('error', (err) => {
                    reject(err);
                    console.log("下载失败!");
                });
            });
        } else {
            console.log("下载失败，状态码:", response.status);  
        }
    } catch (error) {
        console.log("下载失败！", error.message);  
    }
}

module.exports = {
    PostData: postData,
    ExecuteTask: executeTask,
    GetTaskResult: getTaskResult,
    DownloadFile: downloadFile
};
  