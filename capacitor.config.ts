import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'coin.service.school',
  appName: 'School-Survey',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
