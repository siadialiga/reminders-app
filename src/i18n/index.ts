// ─── i18n System ─────────────────────────────────────────────────────────────
// Simple, lightweight internationalization for Reminders app.
// Supports Turkish (tr) and English (en).

export type Language = 'tr' | 'en';

type TranslationKeys = typeof translations['en'];
type TKey = keyof TranslationKeys;

const translations = {
  en: {
    // App
    appName: 'Reminders',
    greeting_morning: 'Good morning',
    greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening',
    greeting_night: 'Good night',
    greeting_suffix: "— what are we focusing on today?",
    user_default: 'User',

    // Smart views
    today: 'Today',
    scheduled: 'Scheduled',
    all: 'All',
    flagged: 'Flagged',
    completed: 'Completed',

    // Sidebar
    myLists: 'My Lists',
    newList: 'New List',
    addList: 'Add List',
    rename: 'Rename',
    delete: 'Delete',
    settings: 'Settings',
    search: 'Search',
    listName: 'List name',
    color: 'Color',
    cancel: 'Cancel',
    create: 'Create',
    confirm: 'Confirm',
    deleteListTitle: 'Delete List?',
    deleteListConfirm: 'Are you sure you want to delete this list and all its tasks?',
    deleteTaskTitle: 'Delete Task?',
    deleteTaskConfirm: 'Are you sure you want to delete this task?',

    // Main area
    tasks: 'Tasks',
    personal: 'Personal',
    work: 'Work',
    shopping: 'Shopping',
    noTasks: 'No tasks',
    completedCount: 'Completed',
    hide: 'Hide',
    show: 'Show',
    clear: 'Clear',
    newReminder: 'New reminder',
    overdue: 'Overdue',

    // Task detail
    details: 'Details',
    done: 'Done',
    title: 'Title',
    notes: 'Notes',
    addNote: 'Add a note…',
    dateTime: 'Date & Time',
    reminder: 'Reminder',
    priority: 'Priority',
    list: 'List',
    flag: 'Flag',
    priority_none: 'None',
    priority_low: 'Low',
    priority_medium: 'Medium',
    priority_high: 'High',
    markComplete: 'Complete',
    markIncomplete: 'Undo',

    // Settings
    settings_title: 'Settings',
    general: 'General',
    notifications: 'Notifications',
    data: 'Data',
    username: 'Username',
    enterName: 'Enter your name',
    save: 'Save',
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    theme_auto: 'Auto',
    showCompleted: 'Show completed',
    showCompletedDesc: 'Show completed tasks in lists?',
    language: 'Language',
    enableNotifications: 'Enable Notifications',
    enableNotificationsDesc: 'Get notified when a task is due',
    notificationInfo: 'Notifications only work when a date and time are set for a task and the "Reminder" option is enabled in task details. The app checks every 30 seconds in the background.',
    deleteAllData: 'Delete All Data',
    deleteAllDataDesc: 'All tasks, lists, and settings will be permanently deleted. This action cannot be undone.',
    clearData: 'Clear Data',
    confirmDelete: 'Yes, delete!',
    dataLocalInfo: 'All data is stored locally on this device. Deleted data cannot be recovered.',
    autoThemeDesc: 'In auto theme, dark mode is used outside the specified time range.',
    dayStart: 'Day start',
    nightStart: 'Night start',
    lightThemeAt: 'Light theme at',
    darkThemeAt: 'Dark theme at',
    autoStart: 'Launch at startup',
    autoStartDesc: 'Automatically start Reminders when you log in',
    minimizeToTray: 'Minimize to tray on close',
    minimizeToTrayDesc: 'Keep the app running in the system tray when closing the window',

    // Onboarding
    onboarding_welcome: 'Welcome! 👋',
    onboarding_welcomeSub: 'Staying organized has never been easier.',
    onboarding_welcomeDesc: "Ready to manage your tasks with a Reminders app inspired by macOS?",
    onboarding_namePage: "Let's get to know you",
    onboarding_namePageSub: 'What should we call you?',
    onboarding_namePageDesc: 'Your name will be used for a personalized experience.',
    onboarding_ready: 'All set! 🎉',
    onboarding_readySub: "Let's get started.",
    onboarding_nameInput: 'What is your name?',
    onboarding_nameError: 'Please enter your name.',
    onboarding_hello: 'Hello,',
    onboarding_continue: 'Continue',
    onboarding_start: 'Get Started',
    onboarding_feat_lists: 'Lists',
    onboarding_feat_reminders: 'Reminders',
    onboarding_feat_priorities: 'Priorities',

    // Update
    updateAvailable: 'A new update is available',
    update: 'Download',
    dismiss: 'Dismiss',
    checkForUpdates: 'Check for updates',
    checkingUpdates: 'Checking for updates...',
    noUpdateFound: 'Your app is up to date',
    updateError: 'Error checking for updates',

    // About
    about: 'About',
    version: 'Version',
    developedWith: 'Developed with',
    portfolio: 'Portfolio',
    github: 'GitHub',
    tray_open: 'Open Reminders',
    tray_exit: 'Exit',
    trash: 'Trash',
    appearance: 'Appearance',
    kanban: 'Kanban Board',
    tags_subtasks: 'Tags & Subtasks',
    trash_bin: 'Trash Bin',
    appearance_desc: 'Choose how Reminders looks on your screen.',
    theme_follows_system: 'Follows your OS',
    theme_clean_bright: 'Clean & bright',
    theme_easy_eyes: 'Easy on the eyes',
    skip_tutorial: 'Skip tutorial',
    onboarding_appearance_step: 'Appearance',

    // New additions
    emptyTrashTitle: 'Empty Trash',
    emptyTrashConfirm: 'Are you sure you want to empty the trash?',
    empty: 'Empty',
    restoreSelected: 'Restore Selected',
    deleteSelected: 'Delete Selected',
    tasksInTrash: 'tasks and',
    listsInTrash: 'lists in trash',
    remindersCount: 'Reminders',
    listsCount: 'Lists',
    noDeletedReminders: 'No deleted reminders.',
    noDeletedLists: 'No deleted lists.',
    deletedPrefix: 'Deleted:',
    boardView: 'Board View',
    listView: 'List View',
    toDo: 'To Do',
    completedCol: 'Completed',
    tagsComma: 'Tags (comma separated)',
    subtasks: 'Subtasks',
    taskName: 'Task name',
    addSubtask: 'Add Subtask',
    back: 'Back',
    finish: 'Finish!',
    next: 'Next',

    // Tutorial
    tut_smart_title: 'Smart Widget Views',
    tut_smart_desc: 'Easily access your urgent and upcoming tasks here. The glow matches their active category!',
    tut_search_title: 'Search Anything',
    tut_search_desc: 'Quickly find any reminder by name or checking the notes inside it.',
    tut_add_task_title: 'Quick Add Reminder',
    tut_add_task_desc: 'Type and hit Enter to quickly create a new task in your current list.',
    tut_view_toggle_title: 'Kanban Board View',
    tut_view_toggle_desc: 'Turn your boring lists into an elegant Trello-style board at any time.',
    tut_add_list_title: 'Create Custom Lists',
    tut_add_list_desc: 'Click here to categorize your reminders with custom names and modern colors.',
    tut_trash_title: 'Trash Bin',
    tut_trash_desc: 'Accidentally deleted something? Soft-deleted items live here until you empty them.',
  },
  tr: {
    // App
    appName: 'Reminders',
    greeting_morning: 'Günaydın',
    greeting_afternoon: 'İyi günler',
    greeting_evening: 'İyi akşamlar',
    greeting_night: 'İyi geceler',
    greeting_suffix: '— bugün neye odaklanıyoruz?',
    user_default: 'Kullanıcı',

    // Smart views
    today: 'Bugün',
    scheduled: 'Planlananlar',
    all: 'Tümü',
    flagged: 'Bayraklı',
    completed: 'Tamamlananlar',

    // Sidebar
    myLists: 'Listelerim',
    newList: 'Yeni Liste',
    addList: 'Yeni Liste Ekle',
    rename: 'Yeniden Adlandır',
    delete: 'Sil',
    settings: 'Ayarlar',
    search: 'Ara',
    listName: 'Liste adı',
    color: 'Renk',
    cancel: 'İptal',
    create: 'Oluştur',
    confirm: 'Onayla',
    deleteListTitle: 'Listeyi Sil?',
    deleteListConfirm: 'Bu listeyi ve içindeki tüm görevleri silmek istediğine emin misin?',
    deleteTaskTitle: 'Görevi Sil?',
    deleteTaskConfirm: 'Bu görevi silmek istediğine emin misin?',

    // Main area
    tasks: 'Görevler',
    personal: 'Kişisel',
    work: 'İş',
    shopping: 'Alışveriş',
    noTasks: 'Görev yok',
    completedCount: 'Tamamlanan',
    hide: 'Gizle',
    show: 'Göster',
    clear: 'Temizle',
    newReminder: 'Yeni anımsatıcı',
    overdue: 'Gecikmiş',

    // Task detail
    details: 'Detaylar',
    done: 'Bitti',
    title: 'Başlık',
    notes: 'Notlar',
    addNote: 'Not ekle…',
    dateTime: 'Tarih & Saat',
    reminder: 'Hatırlatıcı',
    priority: 'Öncelik',
    list: 'Liste',
    flag: 'Bayrak',
    priority_none: 'Yok',
    priority_low: 'Düşük',
    priority_medium: 'Orta',
    priority_high: 'Yüksek',
    markComplete: 'Tamamla',
    markIncomplete: 'Geri al',

    // Settings
    settings_title: 'Ayarlar',
    general: 'Genel',
    notifications: 'Bildirimler',
    data: 'Veri',
    username: 'Kullanıcı Adı',
    enterName: 'İsminizi girin',
    save: 'Kaydet',
    theme: 'Tema',
    theme_light: 'Açık',
    theme_dark: 'Koyu',
    theme_system: 'Sistem',
    theme_auto: 'Otomatik',
    showCompleted: 'Tamamlananları göster',
    showCompletedDesc: 'Listede tamamlanan görevler görüntülensin mi?',
    language: 'Dil',
    enableNotifications: 'Bildirimleri Etkinleştir',
    enableNotificationsDesc: 'Zamanı gelen görevler için bildirim al',
    notificationInfo: 'Bildirimler yalnızca bir görev için tarih ve saat belirlendiğinde ve görev detaylarından "Hatırlatıcı" seçeneği açıldığında çalışır. Uygulama arka planda her 30 saniyede bir kontrol eder.',
    deleteAllData: 'Tüm Verileri Sil',
    deleteAllDataDesc: 'Tüm görevler, listeler ve ayarlar kalıcı olarak silinecek. Bu işlem geri alınamaz.',
    clearData: 'Verileri Temizle',
    confirmDelete: 'Evet, sil!',
    dataLocalInfo: 'Tüm veriler bu cihazda yerel olarak saklanır. Silinen veriler kurtarılamaz.',
    autoThemeDesc: 'Otomatik temada belirtilen saat aralığı dışında koyu tema kullanılır.',
    dayStart: 'Gündüz başlangıcı',
    nightStart: 'Gece başlangıcı',
    lightThemeAt: 'Açık tema saat',
    darkThemeAt: 'Koyu tema saat',
    autoStart: 'Başlangıçta çalıştır',
    autoStartDesc: 'Oturum açtığınızda Reminders otomatik olarak başlasın',
    minimizeToTray: 'Kapatınca sistem tepsisine küçült',
    minimizeToTrayDesc: 'Pencereyi kapattığınızda uygulama sistem tepsisinde çalışmaya devam etsin',

    // Onboarding
    onboarding_welcome: 'Hoş Geldin! 👋',
    onboarding_welcomeSub: 'Düzenli kalmak hiç bu kadar kolay olmamıştı.',
    onboarding_welcomeDesc: "macOS'tan ilham alan Reminders uygulaması ile görevlerini yönetmeye hazır mısın?",
    onboarding_namePage: 'Seni tanıyalım',
    onboarding_namePageSub: 'Sana nasıl hitap edelim?',
    onboarding_namePageDesc: 'Adın, kişiselleştirilmiş bir deneyim için kullanılacak.',
    onboarding_ready: 'Her şey hazır! 🎉',
    onboarding_readySub: 'Hadi başlayalım.',
    onboarding_nameInput: 'Adın nedir?',
    onboarding_nameError: 'Lütfen adını gir.',
    onboarding_hello: 'Merhaba,',
    onboarding_continue: 'Devam Et',
    onboarding_start: 'Başla',
    onboarding_feat_lists: 'Listeler',
    onboarding_feat_reminders: 'Hatırlatıcılar',
    onboarding_feat_priorities: 'Öncelikler',

    // Update
    updateAvailable: 'Yeni bir güncelleme mevcut',
    update: 'İndir',
    dismiss: 'Kapat',
    checkForUpdates: 'Güncellemeleri denetle',
    checkingUpdates: 'Güncellemeler denetleniyor...',
    noUpdateFound: 'Uygulama güncel',
    updateError: 'Güncelleme denetlenirken hata oluştu',

    // About
    about: 'Hakkında',
    version: 'Versiyon',
    developedWith: 'Geliştiren',
    portfolio: 'Portfolyo',
    github: 'GitHub',
    tray_open: 'Uygulamayı Aç',
    tray_exit: 'Çıkış',
    trash: 'Çöp Kutusu',
    appearance: 'Görünüm',
    kanban: 'Kanban Pano',
    tags_subtasks: 'Etiketler & Alt Görevler',
    trash_bin: 'Çöp Kutusu',
    appearance_desc: 'Reminders uygulamasının nasıl görüneceğini seçin.',
    theme_follows_system: 'İşletim sisteminizi takip eder',
    theme_clean_bright: 'Temiz ve aydınlık',
    theme_easy_eyes: 'Göze daha kolay',
    skip_tutorial: 'Eğitimi atla',
    onboarding_appearance_step: 'Görünüm',

    // New additions
    emptyTrashTitle: 'Çöp Kutusunu Boşalt',
    emptyTrashConfirm: 'Çöp kutusunu boşaltmak istediğinize emin misiniz?',
    empty: 'Boşalt',
    restoreSelected: 'Seçilenleri Kurtar',
    deleteSelected: 'Seçilenleri Sil',
    tasksInTrash: 'görev ve',
    listsInTrash: 'liste çöp kutusunda',
    remindersCount: 'Anımsatıcılar',
    listsCount: 'Listeler',
    noDeletedReminders: 'Silinmiş anımsatıcı yok.',
    noDeletedLists: 'Silinmiş liste yok.',
    deletedPrefix: 'Silindi:',
    boardView: 'Pano Görünümü',
    listView: 'Liste Görünümü',
    toDo: 'Yapılacaklar',
    completedCol: 'Tamamlananlar',
    tagsComma: 'Etiketler (virgülle ayırın)',
    subtasks: 'Alt Görevler',
    taskName: 'Görev adı',
    addSubtask: 'Alt Görev Ekle',
    back: 'Geri',
    finish: 'Bitir!',
    next: 'İleri',

    // Tutorial
    tut_smart_title: 'Akıllı Görünümler',
    tut_smart_desc: 'Acil ve yaklaşan görevlerinize buradan kolayca erişin. Parlamalar kategorilerini yansıtır!',
    tut_search_title: 'Her Şeyi Ara',
    tut_search_desc: 'Adıyla veya içindeki notları kontrol ederek herhangi bir anımsatıcıyı hızla bulun.',
    tut_add_task_title: 'Hızlı Anımsatıcı Ekle',
    tut_add_task_desc: 'Yazıp Enter tuşuna basarak bulunduğunuz listede hızla yeni bir görev oluşturun.',
    tut_view_toggle_title: 'Kanban Pano Görünümü',
    tut_view_toggle_desc: 'Sıkıcı listelerinizi istediğiniz zaman şık bir Trello tarzı panoya dönüştürün.',
    tut_add_list_title: 'Özel Listeler Oluştur',
    tut_add_list_desc: 'Anımsatıcılarınızı özel adlar ve modern renklerle kategorize etmek için buraya tıklayın.',
    tut_trash_title: 'Çöp Kutusu',
    tut_trash_desc: 'Yanlışlıkla bir şey mi sildiniz? Silinen öğeler siz onları boşaltana kadar burada kalır.',
  },
} as const;

// ─── Hook & utilities ─────────────────────────────────────────────────────────

let currentLanguage: Language = 'en';
let listeners: Array<() => void> = [];

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  listeners.forEach((fn) => fn());
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: TKey): string {
  return translations[currentLanguage][key] ?? translations['en'][key] ?? key;
}

// React hook
import { useState, useEffect, useCallback } from 'react';

export function useTranslation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((fn) => fn !== handler);
    };
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  return { t, language: currentLanguage, changeLanguage };
}

// Initialize language from settings
export function initLanguage(lang: Language) {
  currentLanguage = lang;
}
