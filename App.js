import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { setAppIcon, getAppIcon } from '@howincodes/expo-dynamic-app-icon';

const BACKGROUND_TASK_NAME = 'HOURLY_ICON_CHECK';

export default function App() {
  const [currentIcon, setCurrentIcon] = useState('Yükleniyor...');
  const [loading, setLoading] = useState(true);

  // Sunucudan ikon durumunu çeken ve uygulayan fonksiyon
  const checkAndApplyIcon = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://karabulut.net.tr/api/sonuc.php');
      const data = await response.json(); // Beklenen: { "result": "C" }
      
      if (data.result === 'A') {
        await setAppIcon('iconA');
        setCurrentIcon('A İkonu Aktif');
      } else if (data.result === 'B') {
        await setAppIcon('iconB');
        setCurrentIcon('B İkonu Aktif');
      } else if (data.result === 'C') {
        await setAppIcon('iconC');
        setCurrentIcon('C İkonu Aktif');
      } else {
        setCurrentIcon('Varsayılan İkon Aktif');
      }
    } catch (error) {
      console.log('İkon güncelleme hatası:', error);
      setCurrentIcon('Bağlantı Hatası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Uygulama açılır açılmaz hemen sunucuyu sorgula
    checkAndApplyIcon();

    // 2. Arka plan görevini her saat başı çalışacak şekilde kaydet
    async function registerBackgroundTask() {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 60 * 60, // 1 Saat (Saniye cinsinden)
          stopOnTerminate: false,
          startOnBoot: true,
        });
      } catch (err) {
        console.log("Arka plan görev kaydı hatası:", err);
      }
    }
    registerBackgroundTask();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hangi Kart</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <Text style={styles.statusText}>{currentIcon}</Text>
      )}
      <Text style={styles.subText}>Sunucu durumu her saat başı ve açılışta kontrol edilir.</Text>
    </View>
  );
}

// Arka plan görev tanımı
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const response = await fetch('https://karabulut.net.tr/api/sonuc.php');
    const data = await response.json();
    
    if (data.result === 'A') await setAppIcon('iconA');
    else if (data.result === 'B') await setAppIcon('iconB');
    else if (data.result === 'C') await setAppIcon('iconC');

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 10 },
  statusText: { fontSize: 18, fontWeight: '600', color: '#007AFF', marginTop: 15 },
  subText: { fontSize: 13, color: '#666', marginTop: 30, textAlign: 'center' }
});