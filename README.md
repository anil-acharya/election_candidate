

यो गाइडले तपाईंलाई यो वेब प्रणाली सुरुदेखि अन्त्यसम्म कसरी सेटअप गर्ने र चलाउने भन्ने सिकाउँछ।

---

## चरण १: सुपाबेस (Supabase) डेटाबेस सेटअप
१. [Supabase.com](https://supabase.com) मा जानुहोस् र एउटा नयाँ **Project** बनाउनुहोस्।
२. **SQL Editor** मा जानुहोस् र यो कोड रन गर्नुहोस्:
   ```sql
   create table candidates (
     id text primary key,
     name text not null,
     party text not null,
     province_id text not null,
     district_id text not null,
     constituency text not null,
     photo_url text,
     symbol_url text, -- नयाँ: चुनाव चिन्हका लागि
     created_at timestamp with time zone default now()
   );
   alter table candidates enable row level security;
   create policy "Public Access" on candidates for all using (true);
   ```
३. प्रोजेक्टको **Settings > API** मा गएर `Project URL` र `anon public` की कपी गर्नुहोस्।
४. यो प्रोजेक्टको `services/dataService.ts` फाइलमा ती कीहरू पेस्ट गर्नुहोस्।

---

## चरण २: कोड होस्टिङ (InfinityFree/Shared Hosting)
१. यो प्रोजेक्टका सबै फाइलहरू डाउनलोड गर्नुहोस्।
२. आफ्नो होस्टिङको `htdocs` फोल्डरमा फाइलहरू अपलोड गर्नुहोस्।
३. **४०४ Error हटाउन:** `htdocs` भित्र `.htaccess` फाइल बनाउनुहोस् र यो कोड राख्नुहोस्:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

---

## चरण ३: एडमिन प्यानल र बल्क इम्पोर्ट (Bulk Import)
१. **लगइन:** `yourdomain.com/admin-anil` मा जानुहोस्।
२. **विवरण:** इमेल: `admin@nepalelection.gov.np` | पासवर्ड: `admin123`
३. **CSV इम्पोर्ट:** धेरै उम्मेदवारहरू एकैपटक थप्न एउटा CSV फाइल बनाउनुहोस् जसमा निम्न Header हुनुपर्छ:
   `name, party, province_id, district_id, constituency, photo_url, symbol_url`
४. एडमिन प्यानलमा **"CSV आयात"** बटन थिचेर फाइल अपलोड गर्नुहोस्।

---

## चरण ४: नयाँ विशेषताहरू (Symbols & UI)
- **Election Symbol:** उम्मेदवारको कार्डमा माथिल्लो दायाँ भागमा चिन्ह देखिनेछ। यसले उम्मेदवार चिन्न मतदातालाई सजिलो बनाउँछ।
- **Image Handling:** यदि उम्मेदवारको फोटो वा चिन्हको लिङ्क बिग्रिएमा सिस्टमले स्वचालित रूपमा "Placeholder" फोटो देखाउँछ।

---

## उम्मेदवारको फोटो र चिन्ह लिङ्क कसरी लिने?
- गुगल वा कुनै न्यूज साइटमा जानुहोस्।
- उम्मेदवारको फोटोमा **Right Click** गर्नुहोस् र **"Copy Image Address"** छान्नुहोस्।
- एडमिन प्यानलको `Photo URL` वा `Symbol URL` बक्समा सो लिङ्क पेस्ट गर्नुहोस्।

---
**निर्वाचन २०२४ - स्वच्छ र सुसूचित नागरिकका लागि।**
