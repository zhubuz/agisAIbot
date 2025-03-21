let fs = require('fs'),
    FormData = require('form-data'),
    path = require("path"),
    ActivityEnums = require("../../enums/ActivityEnums.js"),
    CozeAgentHelper = require("../../helpers/CozeAgentHelper.js"),
    fileHelper = require("../../helpers/FileHelper.js"),
    TaskHelper = require("../../helpers/TaskHelper.js");

async function downloadFileAndUploadToGs(params) {
    let filename = params.FileUrl?.replace(/^.*\/([^\/]+)$/, '$1'),
        fileType = filename.split('.')[1],
        destFolder = path.join(__dirname, '../../../tmp/'),
        filepath = path.join(__dirname, '../../../tmp/'+ filename),
        form = new FormData(),
        response;
    await fileHelper.DownloadFileByUrl({
        DestFolder: destFolder,
        Url: params.FileUrl,
        Filepath: filepath
    });
    form.append('identify', params.Identify);
    form.append('number', 1);
    form.append('total_number', 1);
    form.append('file_type', fileType);
    form.append('file', fs.createReadStream(filepath));
    try {
        response = await TaskHelper.PostData({
            Task: "upload",
            Header: {...form.getHeaders()},
            BodyData: form
        });
        console.log('Upload successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error.response ? error.response.data : error.message);
    }
}

async function createTask(params) {
    let form = new FormData(),
        res;
    if (params.Task === 'liveface') {
        form.append('source_name', params.Sourcename);
        form.append('driver_name', params.Drivername);
    } else if (params.Task === 'face') {
        form.append('img_name', params.Sourcename);
        form.append('video_name', params.Drivername);
    } else if (params.Task === 'imgtoimg') {
        form.append('img_name', params.Sourcename);
        form.append('prompt', params.Prompt);
    }
    res = await TaskHelper.PostData({
        Task: params.Task,
        Header: {...form.getHeaders()},
        BodyData: form
    });
    if (res.code === 200) {
        return res.data.task_id;
    } else {
        throw "create Task failed";
    }
}

async function downloadFile(filename) {
    let outputPath = path.join(__dirname, `../../../tmp/${filename}`);
    await TaskHelper.DownloadFile(filename, outputPath);
    return outputPath;
}

async function generateLiveface(params) {
    console.log("开始执行AI换脸任务");
    let sourcedata,
        driverdata,
        taskId,
        resultPath;
    try {
        sourcedata = await downloadFileAndUploadToGs({
            FileUrl: params.ImageUrl,
            Identify: `face_${Date.now()}`
        });
        driverdata = await downloadFileAndUploadToGs({
            FileUrl: params.VideoUrl,
            Identify: `face_${Date.now()}`
        });
        if (!sourcedata?.file || !driverdata?.file) {
            "upload file failed";
        }
        taskId = await createTask({
            Sourcename: sourcedata.file,
            Drivername: driverdata.file,
            Task: 'liveface'
        });
        await TaskHelper.ExecuteTask(taskId);
        console.log("ExecuteTask taskId:", taskId);
        while (true) {  
            taskResult = await TaskHelper.GetTaskResult(taskId);
            if (taskResult?.Filename || taskResult?.ErrorMsg) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 20000));
        }
        if (taskResult?.ErrorMsg) {
            return taskResult;
        }
        if (taskResult?.Filename) {
            resultPath = await downloadFile(taskResult.Filename);
            console.log("任务执行成功", resultPath);
            return {
                resultPath,
                filename: taskResult?.Filename,
                contentType: 'video/mp4'
            };
        }
        return;
    } catch (error) {
        console.error('任务执行失败:', error);
        // throw error;
    }
}

async function generateFace(params) {
    console.log("开始执行AI换脸任务");
    let sourcedata,
        driverdata,
        taskId,
        taskResult,
        resultPath;
    try {
        sourcedata = await downloadFileAndUploadToGs({
            FileUrl: params.ImageUrl,
            Identify: `face_${Date.now()}`
        });
        driverdata = await downloadFileAndUploadToGs({
            FileUrl: params.VideoUrl,
            Identify: `face_${Date.now()}`
        });
        if (!sourcedata?.file || !driverdata?.file) {
            "upload file failed";
        }
        taskId = await createTask({
            Sourcename: sourcedata.file,
            Drivername: driverdata.file,
            Task: 'face'
        });
        await TaskHelper.ExecuteTask(taskId);
        console.log("ExecuteTask taskId:", taskId);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            taskResult = await TaskHelper.GetTaskResult(taskId);
            if (taskResult?.Filename || taskResult?.ErrorMsg) {
                break;
            }
        }
        if (taskResult?.ErrorMsg) {
            return taskResult;
        }
        console.log("Filename", taskResult?.Filename);
        if (taskResult?.Filename) {
            resultPath = await downloadFile(taskResult.Filename);
            console.log("任务执行成功", resultPath);
            return {
                resultPath,
                filename: taskResult?.Filename,
                contentType: 'video/mp4'
            };
        }
        return;
    } catch (error) {
        console.error('任务执行失败:', error);
        // throw error;
    }
}

async function toStableDiffusion(params) {
    console.log("开始执行文转图任务");
    let taskId,
        taskResult,
        resultPath,
        prompt = params.prompt,
        negativePrompt = params.negative_prompt,
        loraWeight = params.lora_weight,
        promptObj = await CozeAgentHelper.CozeChat({prompt}),
        form = new FormData();
    try {
        if (promptObj?.prompt?.length) {
            prompt = promptObj.prompt;
            negativePrompt = promptObj.negative_prompt;
            loraWeight = promptObj.lora_weight;
        }
        form.append('prompt', prompt);
        form.append('lora_weight', JSON.stringify(loraWeight));
        form.append('mt', params.mt);
        form.append('negative_prompt', negativePrompt);
        console.log("prompt", prompt, loraWeight, negativePrompt);
        res = await TaskHelper.PostData({
            Task: "stablediffusion",
            Header: {...form.getHeaders()},
            BodyData: form
        });
        if (res.code === 200) {
            taskId = res.data.task_id;
        } else {
            throw "create Task failed";
        }
        await TaskHelper.ExecuteTask(taskId);
        console.log("ExecuteTask taskId:", taskId);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            taskResult = await TaskHelper.GetTaskResult(taskId);
            if (taskResult?.Filename || taskResult?.ErrorMsg) {
                break;
            }
        }
        if (taskResult?.ErrorMsg) {
            return taskResult;
        }
        console.log("Filename", taskResult?.Filename);
        if (taskResult?.Filename) {
            resultPath = await downloadFile(taskResult.Filename);
            console.log("任务执行成功", resultPath);
            return {
                resultPath,
                filename: taskResult?.Filename,
                contentType: 'image/png'
            };
        }
        return;
    } catch (error) {
        console.error('任务执行失败:', error);
        // throw error;
    }
}
async function generateImgtoimg(params) {
    console.log("开始执行图转图任务");
    let sourcedata,
        taskId,
        taskResult,
        resultPath;
    try {
        sourcedata = await downloadFileAndUploadToGs({
            FileUrl: params.ImageUrl,
            Identify: `imgtoimg_${Date.now()}`
        });
        if (!sourcedata?.file) {
            "upload file failed";
        }
        taskId = await createTask({
            Sourcename: sourcedata.file,
            Prompt: params.Prompt,
            Task: 'imgtoimg'
        });
        await TaskHelper.ExecuteTask(taskId);
        console.log("ExecuteTask taskId:", taskId);
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            taskResult = await TaskHelper.GetTaskResult(taskId);
            if (taskResult?.Filename || taskResult?.ErrorMsg) {
                break;
            }
        }
        if (taskResult?.ErrorMsg) {
            return taskResult;
        }
        console.log("Filename", taskResult?.Filename);
        if (taskResult?.Filename) {
            resultPath = await downloadFile(taskResult.Filename);
            console.log("任务执行成功", resultPath);
            return {
                resultPath,
                filename: taskResult?.Filename,
                contentType: ActivityEnums.ContentType.photo
            };
        }
        return;
    } catch (error) {
        console.error('任务执行失败:', error);
        // throw error;
    }
}
module.exports = {
    CreateTask: createTask,
    DownloadFile: downloadFile,
    GenerateLiveface: generateLiveface,
    GenerateFace: generateFace,
    ToStableDiffusion: toStableDiffusion,
    GenerateImgtoimg: generateImgtoimg
};