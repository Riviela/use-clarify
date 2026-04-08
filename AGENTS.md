# AI AGENT RULES & PROJECT GUIDELINES (AGENTS.MD)

Bu dosya, bu projede çalışan AI asistanları için **TEK GERÇEKLİK KAYNAĞIDIR**. Aşağıdaki kurallar, kod kalitesini ve proje bütünlüğünü korumak için esastır.

---

## 🚨 1. KIRMIZI ÇİZGİLER (KESİN YASAKLAR)

1.  **SUNUCUYU ASLA BAŞLATMA:** `npm run dev`, `npm start` veya `next dev` komutlarını terminalde **asla** otomatik çalıştırma. Geliştirme sunucusu kullanıcı tarafından ayrı bir terminalde yönetilmektedir.
2.  **MOCK AI VERİSİ YOK:** AI Detector ve AI Humanizer özellikleri için sahte (mock) veri üretme/kullanma. Her zaman gerçek **Groq API** entegrasyonu kur.
3.  **AUTH & ÖDEME SİMÜLASYONU:** Şu an gerçek Auth (Clerk/Auth0) veya Ödeme (Stripe/LemonSqueezy) entegrasyonu **YAPMA**.
    * Kullanıcı durumunu kod içinde bir değişkenle yönet: `const isPremium = true;`
    * Free Kullanıcı: 500 kelime limit, Humanizer kapalı.
    * Premium Kullanıcı: 3000 kelime limit, Humanizer açık.
4.  **VAR OLAN KODU BOZMA:** Yeni özellik eklerken çalışan fonksiyonları (özellikle Dedektör mantığını) bozmadığından emin ol.

---

## 🛠 2. TEKNOLOJİ YIĞINI (TECH STACK)

- **Framework:** Next.js 15+ (App Router `app/` dizini)
- **Dil:** TypeScript 5.7+ (Strict mode)
- **Stil:** Tailwind CSS 3.4+, tailwind-merge, clsx
- **UI Kütüphanesi:** shadcn/ui (Radix UI tabanlı)
- **AI:** Groq SDK (Model: `llama-3.3-70b-versatile` veya benzeri hızlı modeller)
- **İkonlar:** Lucide React
- **Paket Yöneticisi:** npm

---

## 🏗 3. KODLAMA VE MİMARİ STANDARTLARI

### Dosya Organizasyonu
- `app/`: Sadece route ve page bileşenleri.
- `components/ui/`: shadcn/ui bileşenleri.
- `components/`: Özellik bazlı bileşenler (örn: `Detector.tsx`).
- `lib/`: Yardımcı fonksiyonlar ve Groq istemcisi (`ai.ts`).
- `actions/`: Server Actions (`humanize.ts`, `detect.ts`).

### Server Actions & API
- Backend mantığı için **Server Actions** (`"use server"`) kullan.
- API Route (`app/api/`) yerine Server Action tercih et.
- Groq API Key'i asla hardcode etme: `process.env.GROQ_API_KEY` kullan.

### Client vs Server Components
- Varsayılan olarak **Server Component** kullan.
- Sadece `useState`, `useEffect` veya event handler (`onClick`) gereken bileşenlerin tepesine `'use client'` ekle.

### TypeScript Kuralları
- `any` tipini **ASLA** kullanma. Interface ve Type tanımlarını eksiksiz yap.
- Props'lar için `interface` kullan.
- Fonksiyon dönüş tiplerini (Return Types) açıkça belirt.

### Stil ve UI (Tailwind)
- Class birleştirme için `cn()` fonksiyonunu kullan (`lib/utils.ts` içinden).
- shadcn/ui renk değişkenlerini tercih et (`bg-primary`, `text-foreground`).
- Tasarım **Mobile-First** olmalı.

---

## 🧠 4. İŞ MANTIĞI & ÖZELLİKLER

### AI Content Detector
- Metni analiz eder: Human, AI-Generated, AI-Refined.
- **Groq API** zorunludur.
- Sonuçlar detaylı bir obje olarak döner (skor, etiket, sebep).

### AI Humanizer (Sadece Premium)
- AI metnini insan benzeri hale getirir.
- **Groq API** kullanır (System Prompt: Profesyonel editör rolü).
- Free kullanıcılara kilitli - **GÜVENLİK**: Free kullanıcılara asla gerçek metni gönderme, sunucu tarafında dummy/Lorem Ipsum metin üret.
- Blur efekti sadece görsel, gerçek güvenlik sunucu tarafında (Server Action'da `isPremium` kontrolü yap).

### AI Paraphraser (Word Limit: Free 100 kelime)
- Metni farklı kelimelerle yeniden yazar (paraphrase).
- **Groq API** kullanır.
- Free kullanıcılar: 100 kelimeye kadar kullanabilir.
- 100+ kelime: Premium gereklidir.
- **UI Standartı**: Kopyala butonu CardHeader'da olmalı, textarea üzerinde çakışmamalı.

### Grammar Checker (/grammar)
- Dilbilgisi ve imla hatalarını düzeltir.
- **Groq API** kullanır.
- Free: Sadece temel imla hataları.
- Premium: Stil, akıcılık ve ton düzeltmeleri de yapar.

### Summarizer (/summarizer)
- Metni özetler.
- **Groq API** kullanır.
- Free: Sadece "Bullet Points" formatı.
- Premium: "Paragraph", "Executive Summary" formatları (🔒 ikonlu).

### Text Expander (/expander)
- Kısa metni detaylandırır.
- **Groq API** kullanır.
- Free: 300 kelime limit, sadece %30'u gösterir, gerisi dummy text.
- Premium: 3000 kelime limit, tam metin.
- **GÜVENLİK**: Free kullanıcılara asla gerçek metnin tamamını gönderme, sunucu tarafında kes ve dummy text ekle.

### Tone Changer (/tone)
- Metnin tonunu değiştirir.
- **Groq API** kullanır.
- Free: Sadece "Professional" tonu.
- Premium: "Academic", "Casual", "Witty", "Aggressive" tonları (🔒 ikonlu).

### Hallucination Detector (/hallucination)
- Metindeki mantıksal hataları bulur.
- **Groq API** kullanır.
- Free: "3 adet şüpheli iddia bulundu" şeklinde özet uyarı, detaylar gizli/blurlu.
- Premium: Tüm şüpheli iddiaları detaylarıyla listeler.

### Dil Desteği
- Uygulama çok dilli (TR, EN, DE, FR, ES) yapıya uygun tasarlanmalıdır.
- Metinler hardcode olsa bile temiz ve değiştirilebilir olmalıdır.

---

## 📝 5. ÇALIŞTIRMA KOMUTLARI (KULLANICI İÇİN)

```bash
# Geliştirme (Turbo mode)
npm run dev

# Linting
npm run lint