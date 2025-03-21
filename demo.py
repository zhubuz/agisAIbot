import os.path
import time
from pathlib import Path
import requests

# 基础url
base_url = 'http://54.162.180.74:80'
# 上传接口
upload_url = '/api/v1/video/upload'
# AI换脸
ai_face_url = '/api/v1/task/face'
# 表情迁移
live_face_url = '/api/v1/task/liveface'

# 执行任务接口
executing_url = '/api/v1/task/executing/{}'

# 查询任务结果
task_result_url = '/api/v1/task/task_result/{}'


download_url = '/api/v1/video/download/{}'


base_path = Path(__file__).parent.absolute()
example_path = os.path.join(base_path, 'example')
face_path = os.path.join(example_path, 'face')
live_face_path = os.path.join(example_path, 'liveface')


def upload_file(filepath):
	file_type = filepath.split('.')[-1]
	now = int(time.time() * 1000)
	data = {
		'identify': f'face_{now}',
		'number': 1,
		'total_number': 1,
		'file_type': file_type
	}
	with open(filepath, 'rb') as f:
		response = requests.post(f'{base_url}{upload_url}', data=data, files={'file': f})
		if response.status_code == 200:
			ret = response.json()
			if ret['code'] == 200:
				return ret['data']['file']
	print("文件上传失败, status_code:", response.status_code);
	return None


def create_face_task(f1, f2):

	data = {
		'img_name': f1,
		'video_name': f2
	}
	response = requests.post(f'{base_url}{ai_face_url}', data=data)
	if response.status_code == 200:
		ret = response.json()
		if ret['code'] == 200:
			return ret['data']['task_id']
	return None


def create_live_face_task(f1, f2):
	data = {
		'source_name': f1,
		'driver_name': f2
	}
	response = requests.post(f'{base_url}{live_face_url}', data=data)
	if response.status_code == 200:
		ret = response.json()
		if ret['code'] == 200:
			return ret['data']['task_id']
	return None


def execute_task(task_id):
	response = requests.put(f'{base_url}{executing_url.format(task_id)}')
	if response.status_code == 200:
		ret = response.json()
		if ret['code'] == 200:
			return True
	return False


def get_task_result(task_id):
	response = requests.get(f'{base_url}{task_result_url.format(task_id)}')
	if response.status_code == 200:
		ret = response.json()
		if ret['code'] == 200 and isinstance(ret['data'], dict):
			return ret['data']['filename']
	return None


def download_video(filename):
	response = requests.post(f'{base_url}{download_url.format(filename)}', stream=True)
	if response.status_code == 200:
		with open(filename, 'wb') as f:
			for chunk in response.iter_content(chunk_size=1024):
				if chunk:
					f.write(chunk)
				f.flush()
		print("下载完成!")
		return
	print("下载失败!")


def face_main(f1, f2):
	print("开始执行AI换脸任务")
	# 上传图标
	img_name = upload_file(f1)
	# 上传视频
	video_name = upload_file(f2)
	if not all([img_name, video_name]):
		print("任务失败!")
		return
	# 创建任务
	task_id = create_face_task(img_name, video_name)
	# 执行任务
	execute_task(task_id)
	while True:
		filename = get_task_result(task_id)
		if filename:
			break
		time.sleep(20)
		print("任务正在执行中...")
	download_video(filename)
	print("任务执行成功！")


def live_face_main(f1, f2):
	print("开始执行人脸表情任务")
	# 上传图标
	img_name = upload_file(f1)
	# 上传视频
	video_name = upload_file(f2)
	if not all([img_name, video_name]):
		print("任务失败!")
		return
	# 创建任务
	task_id = create_live_face_task(img_name, video_name)
	# 执行任务
	execute_task(task_id)
	while True:
		filename = get_task_result(task_id)
		if filename:
			break
		time.sleep(20)
		print("任务正在执行中...")
	download_video(filename)
	print("任务执行成功")


if __name__ == '__main__':
	# face_img = os.path.join(face_path, 'face.jpg')
	# face_video = os.path.join(face_path, 'd10.mp4')
	# face_main(face_img, face_video)

	live_face_img = os.path.join(live_face_path, 'face.jpg')
	live_face_video = os.path.join(live_face_path, 'd10.mp4')
	live_face_main(live_face_img, live_face_video)

