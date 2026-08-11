"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "el" | "en";

const dict = {
  el: {
    nav: {
      home: "Αρχική",
      services: "Υπηρεσίες",
      about: "Σχετικά",
      contact: "Επικοινωνία",
      book: "Κλείστε ραντεβού",
    },
    home: {
      badge: "Φυσικοθεραπεία στη Θεσσαλονίκη",
      heroTitle: "Η ανάρρωσή σου, με το δικό σου ρυθμό.",
      heroSubtitle:
        "Το Physio ΙΑΣΙΣ συνδυάζει εξατομικευμένη φυσικοθεραπεία με σύγχρονη τεχνολογία ραντεβού. Κλείστε online σε 2 λεπτά ή ρωτήστε τον βοηθό μας οτιδήποτε.",
      ctaBook: "Κλείστε ραντεβού online",
      ctaServices: "Δείτε τις υπηρεσίες",
      trustTitle: "Γιατί ΙΑΣΙΣ",
      trust1Title: "Εξατομικευμένο πλάνο",
      trust1Body: "Κάθε πρόγραμμα αποκατάστασης σχεδιάζεται γύρω από εσένα, όχι γύρω από τη διάγνωση.",
      trust2Title: "Ραντεβού χωρίς τηλέφωνο",
      trust2Body: "Δες διαθεσιμότητα σε πραγματικό χρόνο και κλείσε ραντεβού όποια ώρα θέλεις.",
      trust3Title: "Έμπειρη ομάδα",
      trust3Body: "Πιστοποιημένοι φυσικοθεραπευτές με εξειδίκευση σε αθλητικές κακώσεις και ορθοπεδική αποκατάσταση.",
      servicesTitle: "Οι υπηρεσίες μας",
      servicesSubtitle: "Επιλέξτε τη θεραπεία που ταιριάζει στην κατάστασή σας.",
      seeAll: "Όλες οι υπηρεσίες",
      ctaBandTitle: "Έτοιμοι για το πρώτο σας ραντεβού;",
      ctaBandBody: "Η κράτηση γίνεται online σε λίγα βήματα — ή ρωτήστε τον βοηθό μας κάτω δεξιά.",
      from: "από",
      minutes: "λεπτά",
    },
    services: {
      title: "Υπηρεσίες",
      subtitle: "Θεραπείες φυσικοθεραπείας προσαρμοσμένες στις ανάγκες σας.",
      bookThis: "Κλείστε ραντεβού",
    },
    about: {
      title: "Σχετικά με το Physio ΙΑΣΙΣ",
      intro:
        "Το Physio ΙΑΣΙΣ ιδρύθηκε στη Θεσσαλονίκη με έναν στόχο: να κάνει την αποκατάσταση προσωπική, προσβάσιμη και χωρίς περιττή γραφειοκρατία. Το όνομά μας τιμά την Ίαση, θεά της θεραπείας στην αρχαία Ελλάδα.",
      valuesTitle: "Οι αρχές μας",
      value1: "Ο ασθενής στο κέντρο κάθε απόφασης",
      value2: "Διαφάνεια σε θεραπεία, χρόνο και κόστος",
      value3: "Συνεχής εκπαίδευση στις σύγχρονες μεθόδους",
      teamTitle: "Η ομάδα μας",
    },
    contact: {
      title: "Επικοινωνία",
      subtitle: "Είμαστε εδώ για ό,τι χρειαστείτε.",
      addressLabel: "Διεύθυνση",
      phoneLabel: "Τηλέφωνο",
      emailLabel: "Email",
      hoursLabel: "Ωράριο",
      formName: "Ονοματεπώνυμο",
      formEmail: "Email",
      formMessage: "Μήνυμα",
      formSend: "Αποστολή",
      formSent: "Ευχαριστούμε! Θα επικοινωνήσουμε σύντομα μαζί σας.",
    },
    booking: {
      title: "Κλείστε ραντεβού",
      subtitle: "4 απλά βήματα — χωρίς τηλεφώνημα.",
      step1: "Υπηρεσία",
      step2: "Θεραπευτής",
      step3: "Ημέρα & ώρα",
      step4: "Στοιχεία",
      chooseService: "Επιλέξτε υπηρεσία",
      chooseTherapist: "Επιλέξτε θεραπευτή",
      anyTherapist: "Οποιοσδήποτε διαθέσιμος",
      chooseSlot: "Επιλέξτε διαθέσιμη ώρα",
      noSlots: "Δεν υπάρχουν διαθέσιμες ώρες αυτή την ημέρα. Δοκιμάστε άλλη ημερομηνία.",
      loadingSlots: "Έλεγχος διαθεσιμότητας…",
      fullName: "Ονοματεπώνυμο",
      email: "Email",
      phone: "Τηλέφωνο",
      notes: "Σημειώσεις (προαιρετικό)",
      confirm: "Επιβεβαίωση ραντεβού",
      back: "Πίσω",
      next: "Επόμενο",
      successTitle: "Το ραντεβού σας καταχωρήθηκε!",
      successBody: "Θα λάβετε επιβεβαίωση από την κλινική. Σας ευχαριστούμε που επιλέξατε το Physio ΙΑΣΙΣ.",
      errorGeneric: "Κάτι πήγε στραβά. Δοκιμάστε ξανά ή γράψτε μας στο chat.",
      summary: "Σύνοψη",
      duration: "Διάρκεια",
      price: "Τιμή",
    },
    chat: {
      title: "Βοηθός ΙΑΣΙΣ",
      subtitle: "Ρωτήστε για ραντεβού, υπηρεσίες ή ωράριο",
      placeholder: "Γράψτε το μήνυμά σας…",
      greeting:
        "Γεια σας! Είμαι ο ψηφιακός βοηθός του Physio ΙΑΣΙΣ. Μπορώ να σας βοηθήσω με πληροφορίες για τις υπηρεσίες μας ή να κλείσω ραντεβού για εσάς. Πώς μπορώ να βοηθήσω;",
      send: "Αποστολή",
      thinking: "…",
      error: "Ο βοηθός δεν είναι διαθέσιμος αυτή τη στιγμή. Δοκιμάστε το online booking.",
    },
    footer: {
      tagline: "Φυσικοθεραπεία με προσοχή στη λεπτομέρεια, στη Θεσσαλονίκη.",
      rights: "Με επιφύλαξη παντός δικαιώματος.",
      admin: "Είσοδος προσωπικού",
    },
    admin: {
      loginTitle: "Είσοδος προσωπικού",
      loginSubtitle: "Physio ΙΑΣΙΣ — διαχείριση",
      email: "Email",
      password: "Κωδικός",
      loginButton: "Σύνδεση",
      loginError: "Λάθος στοιχεία σύνδεσης.",
      setupNotice:
        "Το Supabase δεν έχει ρυθμιστεί ακόμη. Πρόσθεσε τα κλειδιά στο .env.local για να ενεργοποιηθεί το login.",
      navDashboard: "Πίνακας",
      navAgenda: "Ατζέντα",
      navClients: "Πελάτες",
      navServices: "Υπηρεσίες",
      navTherapists: "Θεραπευτές",
      navSettings: "Ρυθμίσεις",
      signOut: "Αποσύνδεση",
      backToSite: "Επιστροφή στον ιστότοπο",
      dashboardTitle: "Καλώς ήρθατε",
      todayAppointments: "Σημερινά ραντεβού",
      pendingAppointments: "Σε αναμονή",
      totalClients: "Σύνολο πελατών",
      monthRevenue: "Έσοδα μήνα (τιμολογημένα)",
      quickLinks: "Γρήγορες ενέργειες",
      goToAgenda: "Δες την ατζέντα",
      manageClients: "Διαχείριση πελατών",
      agendaTitle: "Ατζέντα",
      noAppointments: "Δεν υπάρχουν ραντεβού αυτή την ημέρα.",
      statusPending: "Σε αναμονή",
      statusConfirmed: "Επιβεβαιωμένο",
      statusCompleted: "Ολοκληρώθηκε",
      statusCancelled: "Ακυρώθηκε",
      statusNoShow: "Δεν προσήλθε",
      paymentUnpaid: "Απλήρωτο",
      paymentPaid: "Πληρωμένο",
      paymentWaived: "Χωρίς χρέωση",
      clientsTitle: "Πελάτες",
      searchClients: "Αναζήτηση ονόματος, email ή τηλεφώνου…",
      newClient: "Νέος πελάτης",
      fullName: "Ονοματεπώνυμο",
      phone: "Τηλέφωνο",
      birthDate: "Ημ. γέννησης",
      medicalNotes: "Ιατρικό ιστορικό / σημειώσεις",
      save: "Αποθήκευση",
      cancel: "Ακύρωση",
      appointmentHistory: "Ιστορικό ραντεβού",
      noAppointmentsYet: "Δεν υπάρχουν ραντεβού ακόμη.",
      servicesTitle: "Υπηρεσίες",
      newService: "Νέα υπηρεσία",
      nameEl: "Όνομα (EL)",
      nameEn: "Όνομα (EN)",
      descriptionEl: "Περιγραφή (EL)",
      descriptionEn: "Περιγραφή (EN)",
      duration: "Διάρκεια (λεπτά)",
      price: "Τιμή (€)",
      active: "Ενεργό",
      edit: "Επεξεργασία",
      delete: "Διαγραφή",
      therapistsTitle: "Θεραπευτές",
      newTherapist: "Νέος θεραπευτής",
      titleEl: "Τίτλος (EL)",
      titleEn: "Τίτλος (EN)",
      bioEl: "Βιογραφικό (EL)",
      bioEn: "Βιογραφικό (EN)",
      color: "Χρώμα ετικέτας",
      weeklyAvailability: "Εβδομαδιαίο ωράριο",
      settingsTitle: "Ρυθμίσεις κλινικής",
      clinicName: "Όνομα κλινικής",
      address: "Διεύθυνση",
      hoursEl: "Ωράριο (EL)",
      hoursEn: "Ωράριο (EN)",
      saved: "Αποθηκεύτηκε.",
      confirmDelete: "Σίγουρα θέλετε διαγραφή;",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      about: "About",
      contact: "Contact",
      book: "Book now",
    },
    home: {
      badge: "Physiotherapy in Thessaloniki",
      heroTitle: "Your recovery, at your pace.",
      heroSubtitle:
        "Physio ΙΑΣΙΣ pairs hands-on physiotherapy with a modern booking experience. Book online in 2 minutes, or ask our assistant anything.",
      ctaBook: "Book an appointment",
      ctaServices: "See our services",
      trustTitle: "Why ΙΑΣΙΣ",
      trust1Title: "A plan built around you",
      trust1Body: "Every rehabilitation programme is designed around your goals, not just your diagnosis.",
      trust2Title: "Booking without phone calls",
      trust2Body: "See real-time availability and book whenever suits you.",
      trust3Title: "Experienced team",
      trust3Body: "Licensed physiotherapists specialised in sports injuries and orthopaedic rehab.",
      servicesTitle: "Our services",
      servicesSubtitle: "Choose the treatment that fits your needs.",
      seeAll: "All services",
      ctaBandTitle: "Ready for your first session?",
      ctaBandBody: "Booking takes a couple of minutes online — or ask our assistant in the bottom-right corner.",
      from: "from",
      minutes: "min",
    },
    services: {
      title: "Services",
      subtitle: "Physiotherapy treatments tailored to your needs.",
      bookThis: "Book this",
    },
    about: {
      title: "About Physio ΙΑΣΙΣ",
      intro:
        "Physio ΙΑΣΙΣ was founded in Thessaloniki with one goal: making rehabilitation personal, accessible and free of unnecessary friction. Our name honours Iaso, the ancient Greek goddess of healing.",
      valuesTitle: "What we stand for",
      value1: "The patient at the centre of every decision",
      value2: "Transparency on treatment, time and cost",
      value3: "Continuous training in modern methods",
      teamTitle: "Our team",
    },
    contact: {
      title: "Contact",
      subtitle: "We're here for whatever you need.",
      addressLabel: "Address",
      phoneLabel: "Phone",
      emailLabel: "Email",
      hoursLabel: "Opening hours",
      formName: "Full name",
      formEmail: "Email",
      formMessage: "Message",
      formSend: "Send",
      formSent: "Thank you! We'll get back to you shortly.",
    },
    booking: {
      title: "Book an appointment",
      subtitle: "4 simple steps — no phone call needed.",
      step1: "Service",
      step2: "Therapist",
      step3: "Date & time",
      step4: "Your details",
      chooseService: "Choose a service",
      chooseTherapist: "Choose a therapist",
      anyTherapist: "Any available therapist",
      chooseSlot: "Choose an available time",
      noSlots: "No available slots this day. Try another date.",
      loadingSlots: "Checking availability…",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      notes: "Notes (optional)",
      confirm: "Confirm appointment",
      back: "Back",
      next: "Next",
      successTitle: "Your appointment is booked!",
      successBody: "You'll receive confirmation from the clinic. Thank you for choosing Physio ΙΑΣΙΣ.",
      errorGeneric: "Something went wrong. Please try again or use the chat.",
      summary: "Summary",
      duration: "Duration",
      price: "Price",
    },
    chat: {
      title: "ΙΑΣΙΣ Assistant",
      subtitle: "Ask about bookings, services or opening hours",
      placeholder: "Type your message…",
      greeting:
        "Hi! I'm Physio ΙΑΣΙΣ's digital assistant. I can answer questions about our services or book an appointment for you. How can I help?",
      send: "Send",
      thinking: "…",
      error: "The assistant is unavailable right now. Please try the online booking form instead.",
    },
    footer: {
      tagline: "Physiotherapy with an eye for detail, in Thessaloniki.",
      rights: "All rights reserved.",
      admin: "Staff login",
    },
    admin: {
      loginTitle: "Staff login",
      loginSubtitle: "Physio ΙΑΣΙΣ — management",
      email: "Email",
      password: "Password",
      loginButton: "Sign in",
      loginError: "Invalid credentials.",
      setupNotice: "Supabase isn't configured yet. Add the keys to .env.local to enable login.",
      navDashboard: "Dashboard",
      navAgenda: "Agenda",
      navClients: "Clients",
      navServices: "Services",
      navTherapists: "Therapists",
      navSettings: "Settings",
      signOut: "Sign out",
      backToSite: "Back to site",
      dashboardTitle: "Welcome back",
      todayAppointments: "Today's appointments",
      pendingAppointments: "Pending",
      totalClients: "Total clients",
      monthRevenue: "Revenue this month (invoiced)",
      quickLinks: "Quick actions",
      goToAgenda: "Open the agenda",
      manageClients: "Manage clients",
      agendaTitle: "Agenda",
      noAppointments: "No appointments this day.",
      statusPending: "Pending",
      statusConfirmed: "Confirmed",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      statusNoShow: "No-show",
      paymentUnpaid: "Unpaid",
      paymentPaid: "Paid",
      paymentWaived: "Waived",
      clientsTitle: "Clients",
      searchClients: "Search name, email or phone…",
      newClient: "New client",
      fullName: "Full name",
      phone: "Phone",
      birthDate: "Birth date",
      medicalNotes: "Medical history / notes",
      save: "Save",
      cancel: "Cancel",
      appointmentHistory: "Appointment history",
      noAppointmentsYet: "No appointments yet.",
      servicesTitle: "Services",
      newService: "New service",
      nameEl: "Name (EL)",
      nameEn: "Name (EN)",
      descriptionEl: "Description (EL)",
      descriptionEn: "Description (EN)",
      duration: "Duration (minutes)",
      price: "Price (€)",
      active: "Active",
      edit: "Edit",
      delete: "Delete",
      therapistsTitle: "Therapists",
      newTherapist: "New therapist",
      titleEl: "Title (EL)",
      titleEn: "Title (EN)",
      bioEl: "Bio (EL)",
      bioEn: "Bio (EN)",
      color: "Label colour",
      weeklyAvailability: "Weekly schedule",
      settingsTitle: "Clinic settings",
      clinicName: "Clinic name",
      address: "Address",
      hoursEl: "Opening hours (EL)",
      hoursEn: "Opening hours (EN)",
      saved: "Saved.",
      confirmDelete: "Are you sure you want to delete this?",
    },
  },
} as const;

type Dict = typeof dict.el;

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("el");

  useEffect(() => {
    const stored = window.localStorage.getItem("physio-iasis-lang");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "el" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("physio-iasis-lang", l);
  };

  const t = useMemo(() => {
    return (path: string) => {
      const value = get(dict[lang], path);
      return typeof value === "string" ? value : path;
    };
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

export type { Dict };
