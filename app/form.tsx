import Combobox from '@/components/combobox';
import SelectCard from '@/components/select-card';
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { responsiveScale } from "@/constants/scaling";
import { Colors, Radius } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Checkbox } from 'expo-checkbox';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SelectedFile = {
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
};

export default function Form() {
  const backgroundColor = useThemeColor({}, 'background');
  const today = new Date();
  const defaultBirthDate = new Date(2000, 0, 1);
  const [draftBirthDate, setDraftBirthDate] = useState<Date>(defaultBirthDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);
  // Form state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nik, setNik] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [selectedGender, setGender] = useState<string | null>(null);
  const [selectedLastEducation, setLastEducation] = useState<string | null>(null);
  const [selectedOccupation, setOccupation] = useState<string | null>(null);
  const [selectedPurpose, setPurpose] = useState<string | null>(null);
  const [selectedRequestLetter, setRequestLetter] = useState<SelectedFile | null>(null);
  const [selectedProposalLetter, setProposalLetter] = useState<SelectedFile | null>(null);
  const [selectedConductLetter, setConductLetter] = useState<SelectedFile | null>(null);
  const [selectedStatementLetter, setStatementLetter] = useState<SelectedFile | null>(null);
  const [isCheckedOne, setCheckedOne] = useState(false);
  const [isCheckedTwo, setCheckedTwo] = useState(false);

  const formatBirthDate = (value: Date | null) => {
    if (!value) {
      return 'Pilih tanggal lahir';
    }

    return value.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const openBirthDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: birthDate ?? defaultBirthDate,
        mode: 'date',
        display: 'calendar',
        maximumDate: today,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            setBirthDate(selectedDate);
          }
        },
      });

      return;
    }

    setDraftBirthDate(birthDate ?? defaultBirthDate);
    setShowDatePicker(true);
  };

  const handleIOSDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDraftBirthDate(selectedDate);
    }
  };

  const pickDocument = async (setSelectedFile: React.Dispatch<React.SetStateAction<SelectedFile | null>>) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    setSelectedFile({
      name: file.name ?? 'Berkas tidak bernama',
      uri: file.uri,
      size: file.size,
      mimeType: file.mimeType,
    });
  };

  const fileCard = (selectedFile: SelectedFile | null) => (
    <View style={styles.fileCard}>
      <ThemedText type="defaultSemiBold">
        {selectedFile ? selectedFile.name : 'Belum ada file dipilih'}
      </ThemedText>
      <ThemedText
        type="caption"
        darkColor={Colors.dark.text.secondary}
        lightColor={Colors.light.text.secondary}
        style={{ marginTop: 4 }}
      >
        {selectedFile
          ? `${selectedFile.mimeType ?? 'Jenis file tidak terdeteksi'}${selectedFile.size ? ` · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}`
          : 'File akan tampil di sini setelah dipilih.'}
      </ThemedText>
    </View>
  )

  // const formStep1Valid = fullname.trim() !== '' && email.trim() !== '' && phone.trim() !== '' && nik.trim() !== '' && birthDate !== null && selectedGender && selectedLastEducation && selectedOccupation && selectedPurpose;
  const formStep3Valid = isCheckedOne && isCheckedTwo;

  const changeStep = (newStep: number) => {
    // if (newStep === 2 && !formStep1Valid) {
    //   Alert.alert('Form belum lengkap', 'Silakan lengkapi semua kolom yang wajib diisi sebelum melanjutkan ke langkah berikutnya.');
    //   return;
    // }
    if ((step === 3 && !formStep3Valid) && newStep !== 2) {
      Alert.alert('Perhatian Pengguna', 'Anda harus mengetahui dan menyetujui syarat dan ketentuan yang berlaku sebelum mengirim pengajuan. Mohon centang kedua kolom pernyataan untuk melanjutkan.');
      return;
    }
    setStep(newStep);
  }

  return (
    <ScrollView style={{ paddingVertical: 20 }} contentInsetAdjustmentBehavior="automatic">
      <View style={{ gap: 8, paddingHorizontal: 24, paddingBottom: responsiveScale(100) }}>
        <ThemedView style={[styles.card, { gap: 8, marginBottom: 8 }]}>
          <ThemedText type="title4" style={{}}>
            Formulir Rekomendasi Penelitian
          </ThemedText>
          <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary} style={{ textAlign: 'left' }}>
            Silakan isi formulir di bawah ini untuk mengajukan rekomendasi. Rekomendasi akan kami proses dalam waktu 1x24 jam, dan selesai dalam waktu 3 Hari Kerja. Pastikan semua informasi yang Anda berikan akurat dan lengkap untuk mempercepat proses pengajuan.
          </ThemedText>
          <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary} style={{ textAlign: 'left' }}>
            Jika Anda memiliki pertanyaan atau membutuhkan bantuan, hubungi kami melalui tombol Whatsapp di bawah.
          </ThemedText>
          <ThemedButton variant="secondary" icon={(<Image source={require('@/assets/images/whatsapp.png')} style={{ width: 20, height: 20, marginEnd: 4, marginStart: -2 }} />)} size="small" style={{ alignSelf: 'flex-start' }}>
            Whatsapp
          </ThemedButton>
          <ThemedText type="caption" darkColor={Colors.accentRed} lightColor={Colors.accentRed}>
            Kolom *) wajib diisi
          </ThemedText>
        </ThemedView>
        {step === 1 && (
          <View style={{ gap: 16 }}>
            {/* Email */}
            <ThemedView style={styles.card}>
              <ThemedTextInput title="Email" variant="transparent" placeholder="Masukan email" value={email} onChangeText={setEmail} autoComplete="email"
                keyboardType="email-address" lightColor={backgroundColor} darkColor={backgroundColor} underline required />
            </ThemedView>
            {/* Nama Lengkap */}
            <ThemedView style={styles.card}>
              <ThemedTextInput title="Nama Lengkap" variant="transparent" placeholder="Masukan nama lengkap" value={fullname} onChangeText={setFullname} autoComplete="name"
                lightColor={backgroundColor} darkColor={backgroundColor} underline required />
            </ThemedView>
            {/* Nomor Telepon */}
            <ThemedView style={styles.card}>
              <ThemedTextInput title="Nomor Telepon" variant="transparent" placeholder="Masukan nomor telepon" value={phone} onChangeText={setPhone} autoComplete="tel" keyboardType="phone-pad"
                lightColor={backgroundColor} darkColor={backgroundColor} underline required />
            </ThemedView>
            {/* NIK */}
            <ThemedView style={styles.card}>
              <ThemedTextInput title="Nomor Induk Kependudukan (NIK)" variant="transparent" placeholder="Masukan nomor induk kependudukan" value={nik} onChangeText={setNik} autoComplete="off" keyboardType="number-pad"
                lightColor={backgroundColor} darkColor={backgroundColor} underline required />
            </ThemedView>
            {/* Tanggal Lahir */}
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                Tanggal Lahir
                <Text style={{ color: Colors.accentRed }}>
                  {' *'}
                </Text>
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={openBirthDatePicker}
                style={({ pressed }) => [
                  styles.dateField,
                  { backgroundColor },
                  pressed && styles.dateFieldPressed,
                ]}
              >
                <View style={styles.dateFieldContent}>
                  <ThemedText
                    type={birthDate ? 'default' : 'default'}
                    lightColor={birthDate ? undefined : Colors.light.text.tertiary}
                    darkColor={birthDate ? undefined : Colors.dark.text.tertiary}
                  >
                    {formatBirthDate(birthDate)}
                  </ThemedText>
                  <ThemedText lightColor={Colors.light.text.secondary} darkColor={Colors.dark.text.secondary}>
                    ▾
                  </ThemedText>
                </View>
              </Pressable>
            </ThemedView>
            {/* Jenis Kelamin */}
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                Jenis Kelamin
                <Text style={{ color: Colors.accentRed }}>
                  {' *'}
                </Text>
              </ThemedText>
              <SelectCard
                options={[
                  { label: 'Laki-laki', value: 'men' },
                  { label: 'Perempuan', value: 'women' },
                ]}
                selectedValue={selectedGender}
                onValueChange={(value) => setGender(value)}
              />
            </ThemedView>
            {/* Pendidikan Terakhir */}
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                Pendidikan Terakhir
                <Text style={{ color: Colors.accentRed }}>
                  {' *'}
                </Text>
              </ThemedText>
              <SelectCard
                options={[
                  { label: 'SMA/SMK', value: 'sma' },
                  { label: 'Diploma', value: 'diploma' },
                  { label: 'S1', value: 's1' },
                  { label: 'S2', value: 's2' },
                  { label: 'S3', value: 's3' },
                ]}
                selectedValue={selectedLastEducation}
                onValueChange={(value: string) => setLastEducation(value)}
              />
            </ThemedView>
            {/* Pekerjaan */}
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                Pekerjaan
                <Text style={{ color: Colors.accentRed }}>
                  {' *'}
                </Text>
              </ThemedText>
              <Combobox
                options={[
                  { label: 'Pegawai Negeri', value: 'government_employee' },
                  { label: 'Pegawai Swasta', value: 'private_employee' },
                  { label: 'Wiraswasta', value: 'entrepreneur' },
                  { label: 'Pelajar/Mahasiswa', value: 'student' },
                  { label: 'Lainnya', value: 'other' },
                  { label: 'Pegawai Negeri', value: 'government_employee2' },
                  { label: 'Pegawai Swasta', value: 'private_employee2' },
                  { label: 'Wiraswasta', value: 'entrepreneur2' },
                  { label: 'Pelajar/Mahasiswa', value: 'student2' },
                  { label: 'Lainnya', value: 'other2' },
                  { label: 'Pegawai Negeri', value: 'government_employee3' },
                  { label: 'Pegawai Swasta', value: 'private_employee3' },
                  { label: 'Wiraswasta', value: 'entrepreneur3' },
                  { label: 'Pelajar/Mahasiswa', value: 'student3' },
                  { label: 'Lainnya', value: 'other3' },
                ]}
                selectedValue={selectedOccupation}
                onValueChange={(value) => setOccupation(value)}
                placeholder="Pilih pekerjaan"
                searchPlaceholder="Cari pekerjaan"
                titlePlaceholder="Pilih Pekerjaan Anda"
              />
            </ThemedView>
            {/* Pekerjaan */}
            <ThemedView style={styles.card}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                Tujuan Pengajuan
                <Text style={{ color: Colors.accentRed }}>
                  {' *'}
                </Text>
              </ThemedText>
              <SelectCard
                options={[
                  { label: 'Permohonan Data Awal/Studi Pendahuluan', value: '1' },
                  { label: 'Penelitian Tugas Akhir', value: '2' },
                  { label: 'Penelitian dengan pendanaan APBD/APBN', value: '3' },
                  { label: 'Penelitian mendapatkan SKP dari DPMPTSP', value: '4' },
                ]}
                selectedValue={selectedPurpose}
                column={1}
                textAlign='flex-start'
                onValueChange={(value) => setPurpose(value)}
              />
            </ThemedView>
            {/* Birthdate Modal */}
            <Modal
              animationType="fade"
              transparent
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)}>
                <Pressable style={[styles.modalSheet, { backgroundColor }]} onPress={() => undefined}>
                  <SafeAreaView>
                    <View style={styles.modalHeader}>
                      <Pressable onPress={() => setShowDatePicker(false)} hitSlop={10}>
                        <ThemedText type="defaultSemiBold" lightColor={Colors.light.text.secondary} darkColor={Colors.dark.text.secondary}>
                          Batal
                        </ThemedText>
                      </Pressable>
                      <ThemedText type="defaultSemiBold">
                        Pilih tanggal lahir
                      </ThemedText>
                      <Pressable
                        onPress={() => {
                          setBirthDate(draftBirthDate);
                          setShowDatePicker(false);
                        }}
                        hitSlop={10}
                      >
                        <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
                          Simpan
                        </ThemedText>
                      </Pressable>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <DateTimePicker
                        value={draftBirthDate}
                        mode="date"
                        display="spinner"
                        onChange={handleIOSDateChange}
                        maximumDate={today}
                        style={{ backgroundColor }}
                      />
                    </View>
                  </SafeAreaView>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        )}
        {step === 2 && (
          <View style={{ gap: 8 }}>
            <ThemedView style={[styles.card, { gap: 14 }]}>
              <View style={{ gap: 4 }}>
                <ThemedText type="defaultSemiBold">
                  Surat Permohonan Rekomendasi
                  <Text style={{ color: Colors.accentRed }}>
                    {' *'}
                  </Text>
                </ThemedText>
                <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                  Unggah berkas dalam format PDF, dengan ukuran maksimal 2 MB.
                </ThemedText>
              </View>
              <ThemedButton variant="secondary" onPress={() => pickDocument(setRequestLetter)} style={{ alignSelf: 'flex-start' }}>
                Pilih file dari perangkat
              </ThemedButton>
              {fileCard(selectedRequestLetter)}
            </ThemedView>
            {selectedPurpose !== '1' && (
              <View style={{ gap: 8 }}>
                <ThemedView style={[styles.card, { gap: 14 }]}>
                  <View style={{ gap: 4 }}>
                    <ThemedText type="defaultSemiBold">
                      Surat Proposal Penelitian
                      <Text style={{ color: Colors.accentRed }}>
                        {' *'}
                      </Text>
                    </ThemedText>
                    <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                      Unggah berkas dalam format PDF, dengan ukuran maksimal 2 MB.
                    </ThemedText>
                  </View>
                  <ThemedButton variant="secondary" onPress={() => pickDocument(setProposalLetter)} style={{ alignSelf: 'flex-start' }}>
                    Pilih file dari perangkat
                  </ThemedButton>
                  {fileCard(selectedProposalLetter)}
                </ThemedView>
                <ThemedView style={[styles.card, { gap: 14 }]}>
                  <View style={{ gap: 4 }}>
                    <ThemedText type="defaultSemiBold">
                      Surat Keterangan Etik
                      <Text style={{ color: Colors.accentRed }}>
                        {' *'}
                      </Text>
                    </ThemedText>
                    <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                      Unggah berkas dalam format PDF, dengan ukuran maksimal 2 MB.
                    </ThemedText>
                  </View>
                  <ThemedButton variant="secondary" onPress={() => pickDocument(setConductLetter)} style={{ alignSelf: 'flex-start' }}>
                    Pilih file dari perangkat
                  </ThemedButton>
                  {fileCard(selectedConductLetter)}
                </ThemedView>
                <ThemedView style={[styles.card, { gap: 14 }]}>
                  <View style={{ gap: 4 }}>
                    <ThemedText type="defaultSemiBold">
                      Surat Pernyataan Laporan Akhir
                      <Text style={{ color: Colors.accentRed }}>
                        {' *'}
                      </Text>
                    </ThemedText>
                    <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                      Unggah berkas dalam format PDF, dengan ukuran maksimal 2 MB.
                    </ThemedText>
                  </View>
                  <ThemedButton variant="secondary" onPress={() => pickDocument(setStatementLetter)} style={{ alignSelf: 'flex-start' }}>
                    Pilih file dari perangkat
                  </ThemedButton>
                  {fileCard(selectedStatementLetter)}
                </ThemedView>
              </View>
            )}
          </View>
        )}
        {step === 3 && (
          <View style={{ gap: 8 }}>
            <ThemedView style={[styles.card, { gap: 16 }]}>
              <ThemedText type="subheadline">
                Dengan mengisi formulir ini, Anda menyetujui syarat dan ketentuan yang berlaku. Pastikan semua informasi yang Anda berikan akurat dan lengkap untuk mempercepat proses pengajuan. Pengajuan akan kami proses dalam waktu 1x24 jam, dan selesai dalam waktu 3 Hari Kerja.
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                <Checkbox hitSlop={10} value={isCheckedOne} onValueChange={setCheckedOne} style={{ marginTop: 4 }} />
                <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => setCheckedOne(!isCheckedOne)}>
                  <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                    Saya mengetahui bahwa proses pengajuan membutuhkan waktu maximal 3 hari kerja
                  </ThemedText>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                <Checkbox hitSlop={10} value={isCheckedTwo} onValueChange={setCheckedTwo} style={{ marginTop: 4 }} />
                <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => setCheckedTwo(!isCheckedTwo)}>
                  <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                    Saya menyetujui bahwa segala bentuk pengajuan ini akan menjadi hak milik dinas
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        )
        }
        <View style={{ marginStart: 20 }}>
          <ThemedText type="subheadline" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
            Langkah {step} dari 3
          </ThemedText>
        </View>
        <View style={{ marginTop: 4, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          {step > 1 && (
            <ThemedButton variant="secondary" onPress={() => {
              if (step > 1) {
                changeStep(step - 1);
              }
            }}>
              Kembali
            </ThemedButton>
          )}
          {step < 3 && (
            <ThemedButton variant="primary" onPress={() => {
              if (step < 3) {
                changeStep(step + 1);
              }
            }}>
              Selanjutnya
            </ThemedButton>
          )}
          {step === 3 && (
            <ThemedButton variant="primary" onPress={() => {
              changeStep(step);
            }}>
              Kirim
            </ThemedButton>
          )}
        </View>
      </View >
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.default,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  dateField: {
    borderRadius: Radius.default,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10
  },
  dateFieldPressed: {
    opacity: 0.85,
  },
  dateFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  fileCard: {
    borderRadius: Radius.default,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
});