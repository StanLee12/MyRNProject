import React from 'react';
import {Node, useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import fs, {
  DownloadBeginCallbackResult,
  DownloadFileOptions,
  DownloadProgressCallbackResult,
  DownloadResult,
} from 'react-native-fs';

const FILE_DIR = `${fs.DocumentDirectoryPath}/stan`;

const App: () => Node = () => {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [path, setPath] = useState('');
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState('');
  const [content, setContent] = useState('');
  const [downloadRes, setDownloadRes] = useState('');

  useEffect(() => {
    createDir();
  }, []);

  /**
   * 在Document文件夹下新建一个名为stan的文件夹，如已存在则不创建
   * @returns
   */
  const createDir = async () => {
    try {
      const isExist = await fs.exists(FILE_DIR);
      if (isExist) {
        return;
      }
      await fs.mkdir(FILE_DIR);
    } catch (err) {
      setError(err);
    }
  };

  const onChangeText = (val: string) => {
    setUrl(val);
  };

  /**
   * 获取下载链接中文件的名称
   * @param {string} fileUrl
   * @returns 文件名称
   */
  const getFileName = (fileUrl: string) => {
    const index = fileUrl.lastIndexOf('/');
    return fileUrl.substring(index + 1);
  };

  const startDownload = async () => {
    if (jobId) {
      setError('正在下载, 请勿重复下载');
      return;
    }
    // 如果输入框内没有填写下载的url，则使用默认的测试下载url
    const fromUrl = url || 'https://media.w3.org/2010/05/sintel/trailer.mp4';
    // 文件要保存的位置，名称为下载链接中的文件本身
    const toFile = `${FILE_DIR}/${getFileName(fromUrl)}`;
    // 展示文件存储的位置
    setPath(toFile);
    // 配置下载的选项
    const options: DownloadFileOptions = {
      fromUrl,
      toFile,
      // 开始下载时会触发该函数
      begin: (res: DownloadBeginCallbackResult) => {
        setContent(
          `jobId: ${res.jobId} statusCode: ${res.statusCode} contentLength: ${res.contentLength}`,
        );
      },
      // 下载过程中会触发该函数, 可以用来展示进度条
      progress: (res: DownloadProgressCallbackResult) => {
        setProgress(
          `${res.bytesWritten}/${res.contentLength}  ${Math.round(
            (res.bytesWritten / res.contentLength) * 100,
          )}%`,
        );
      },
    };
    try {
      const {jobId: id, promise} = await fs.downloadFile(options);
      // 展示下载的jobId, jobId是用来中断对应的下载
      setJobId(id);
      promise
        .then((res: DownloadResult) => {
          // 展示请求下载文件的返回结果
          setDownloadRes(
            `jobId: ${res.jobId} statusCode: ${res.statusCode} bytesWritten: ${res.bytesWritten}`,
          );
        })
        .catch(err => {
          // 展示下载过程中出现的错误
          setError(err);
        });
    } catch (err) {
      setError(err);
    } finally {
      setJobId('');
    }
  };

  const stopDownload = () => {
    if (!jobId) {
      return;
    }
    // 中断对应jobId的下载操作
    fs.stopDownload(jobId);
  };

  const clearMessage = () => {
    setContent('');
    setDownloadRes('');
    setError('');
    setPath('');
    setProgress('');
    setUrl('');
  };

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <TextInput style={styles.input} onChangeText={onChangeText} value={url} />
      <Text>{`下载进度: ${progress}`}</Text>
      <Text>{`文件路径: ${path}`}</Text>
      <Text>{`错误信息: ${error}`}</Text>
      <Text>{`Job ID: ${jobId}`}</Text>
      <Text>{content}</Text>
      <Text>{`下载结果: ${downloadRes}`}</Text>
      <TouchableOpacity style={styles.button} onPress={startDownload}>
        <Text style={styles.buttonLabel}>开始下载</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancel} onPress={stopDownload}>
        <Text style={styles.buttonLabel}>取消下载</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clear} onPress={clearMessage}>
        <Text style={styles.buttonLabel}>清楚所有信息</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    marginTop: 50,
    width: 200,
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    marginTop: 50,
    width: 150,
    alignItems: 'center',
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  buttonLabel: {
    color: 'white',
  },
  cancel: {
    marginTop: 30,
    width: 150,
    alignItems: 'center',
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
  },
  clear: {
    marginTop: 30,
    width: 150,
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
  },
});

export default App;
