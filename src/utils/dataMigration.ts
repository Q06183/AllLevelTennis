import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useStore } from '../store';
import { useCoachStore } from '../store/coachStore';

export const exportData = async () => {
  try {
    const appData = await AsyncStorage.getItem('tennis-app-storage');
    const coachData = await AsyncStorage.getItem('all-level-tennis-coach-storage');
    
    const backup = {
      appData: appData ? JSON.parse(appData) : null,
      coachData: coachData ? JSON.parse(coachData) : null,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `AllLevelTennis_Backup_${dateStr}.json`;
    
    const file = new File(Paths.cache, fileName);
    file.write(JSON.stringify(backup));
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: '导出网球教练与学员数据',
      });
    } else {
      Alert.alert('导出失败', '当前设备不支持分享文件');
    }
  } catch (error) {
    Alert.alert('导出失败', '无法导出数据');
    console.error('Error exporting data:', error);
  }
};

let isImporting = false;

export const importData = async () => {
  if (isImporting) return;
  isImporting = true;
  
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'public.json'],
      copyToCacheDirectory: true,
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      isImporting = false;
      return;
    }
    
    const fileUri = result.assets[0].uri;
    const fileContent = await new File(fileUri).text();
    let backup;
    try {
      backup = JSON.parse(fileContent);
    } catch (e) {
      isImporting = false;
      Alert.alert('导入失败', '所选文件不是有效的 JSON 文件');
      return;
    }
    
    // 增加日志以调试导入的文件内容
    console.log('Imported Backup Content:', JSON.stringify(backup).substring(0, 200));

    // 放宽校验逻辑：只要包含 appData 或 coachData 即可
    if (!backup || (backup.appData === undefined && backup.coachData === undefined)) {
      isImporting = false;
      Alert.alert('导入失败', '无效的备份文件结构');
      return;
    }
    
    // 弹出二次确认弹窗
    Alert.alert(
      '确认导入备份？',
      '导入后，当前应用内的所有打卡记录、备忘录、学员档案及教案将被完全覆盖。此操作不可逆！',
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: () => { isImporting = false; }
        },
        {
          text: '确认覆盖',
          style: 'destructive',
          onPress: () => {
            try {
              if (backup.appData && backup.appData.state) {
                useStore.setState(backup.appData.state);
              }
              if (backup.coachData && backup.coachData.state) {
                useCoachStore.setState(backup.coachData.state);
              }
              isImporting = false;
              Alert.alert('导入成功', '数据已成功恢复，页面已自动刷新');
            } catch (err) {
              isImporting = false;
              Alert.alert('导入失败', '恢复数据时出错');
              console.error('Error hydrating state:', err);
            }
          }
        }
      ]
    );
  } catch (error) {
    isImporting = false;
    Alert.alert('导入失败', '无法读取备份文件');
    console.error('Error importing data:', error);
  }
};
