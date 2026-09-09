import React from "react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cake, PartyPopper, Gift, X, Mail } from "lucide-react";

export default function RightPanel() {
  type Birthday = {
    slno: number;
    employee: string;
    email: string;
    date_of_birth: string;
  };

  type EventPhoto = {
    photoId: number;
    fileName: string;
    filePath: string;
  };

  type EventGallery = {
    eventId: number;
    eventName: string;
    eventType?: string;
    photos: EventPhoto[];
  };

  type EventOption = {
    eventId: number;
    eventName: string;
  };

  const ALLOWED_PHOTO_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ]);
  const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Birthday | null>(null);
  const [user, setUser] = useState<{ username: string; roles?: string[] } | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number; dur: number; shape: string }[]>([]);

  const [eventGalleries, setEventGalleries] = useState<EventGallery[]>([]);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createEventMode, setCreateEventMode] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [modalError, setModalError] = useState("");
  const [eventForm, setEventForm] = useState({
    eventName: "",
    eventType: "",
    eventDate: "",
    location: "",
    description: "",
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredEvent = eventGalleries[0];
  const secondaryEventA = eventGalleries[1];
  const secondaryEventB = eventGalleries[2];

  const featuredPhotos = featuredEvent?.photos ?? [];
  const secondaryPhotosA = secondaryEventA?.photos ?? [];
  const secondaryPhotosB = secondaryEventB?.photos ?? [];

  const featuredEventImage =
    featuredPhotos[currentIndex % Math.max(featuredPhotos.length, 1)]?.filePath ?? "";
  const diwaliEventImage =
    secondaryPhotosA[currentIndex % Math.max(secondaryPhotosA.length, 1)]?.filePath ?? "";
  const dussehraSecondaryEventImage =
    secondaryPhotosB[currentIndex % Math.max(secondaryPhotosB.length, 1)]?.filePath ?? "";

  const eventHighlights = [
    {
      title: featuredEvent?.eventName ?? "",
      meta: featuredEvent ? `${featuredPhotos.length} photos` : "",
    },
    {
      title: secondaryEventA?.eventName ?? "",
      meta: secondaryEventA ? `${secondaryPhotosA.length} photos` : "",
    },
    {
      title: secondaryEventB?.eventName ?? "",
      meta: secondaryEventB ? `${secondaryPhotosB.length} photos` : "",
    },
  ];

  const eventImages = eventGalleries.flatMap((event) =>
    event.photos.map((photo) => photo.filePath),
  );

  const [bdayLoading, setBdayLoading] = useState(true);
  const [carouselReady, setCarouselReady] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeLightboxImage =
    lightboxIndex !== null && eventImages.length > 0
      ? eventImages[(lightboxIndex + eventImages.length) % eventImages.length]
      : null;

  const canUpload =
    !!selectedEventId &&
    !!selectedFile &&
    ALLOWED_PHOTO_TYPES.has((selectedFile.type || "").toLowerCase()) &&
    selectedFile.size > 0 &&
    selectedFile.size <= MAX_PHOTO_SIZE;

  const canCreateEvent = Array.isArray(user?.roles)
    ? user.roles.some((role) => String(role).toLowerCase() === "hr")
    : false;

  function openLightboxBySrc(src: string) {
    if (!src || eventImages.length === 0) return;
    const idx = eventImages.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : 0);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function showPrevLightbox(e?: React.MouseEvent) {
    e?.stopPropagation();
    setLightboxIndex((p) => {
      if (p === null || eventImages.length === 0) return p;
      return (p - 1 + eventImages.length) % eventImages.length;
    });
  }

  function showNextLightbox(e?: React.MouseEvent) {
    e?.stopPropagation();
    setLightboxIndex((p) => {
      if (p === null || eventImages.length === 0) return p;
      return (p + 1) % eventImages.length;
    });
  }

  async function loadEventGalleries() {
    try {
      const r = await fetch("/api/events/photos", { cache: "no-store" });
      if (!r.ok) {
        setCarouselReady(true);
        return;
      }
      const d = await r.json();
      if (Array.isArray(d.events)) {
        setEventGalleries(d.events);
        if (!d.events[0]?.photos?.length) setCarouselReady(true);
      } else {
        setCarouselReady(true);
      }
    } catch {
      setCarouselReady(true);
    }
  }

  async function loadEventOptions() {
    setLoadingEvents(true);
    try {
      const r = await fetch("/api/events", { cache: "no-store" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d?.error || "Unable to load events.");
      }
      const d = await r.json();
      if (Array.isArray(d.events)) {
        setEventOptions(d.events);
      }
    } catch (err: any) {
      setModalError(err?.message || "Unable to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }

  function resetUploadModal() {
    setUploadModalOpen(false);
    setCreateEventMode(false);
    setSelectedEventId("");
    setSelectedFile(null);
    setCreatingEvent(false);
    setUploading(false);
    setModalError("");
    setEventForm({
      eventName: "",
      eventType: "",
      eventDate: "",
      location: "",
      description: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openUploadModal() {
    setUploadNote("");
    setModalError("");
    setCreateEventMode(false);
    setSelectedFile(null);
    setUploadModalOpen(true);
    loadEventOptions();
  }

  function isValidPhoto(file: File) {
    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED_PHOTO_TYPES.has(mime)) {
      return "Only PNG, JPG, JPEG, and WEBP are allowed";
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return "File is too large. Maximum size is 10MB";
    }
    return "";
  }

  async function handlePhotoUpload() {
    if (!selectedEventId) {
      setModalError("Please select an event.");
      return;
    }
    if (!selectedFile) {
      setModalError("Please select a photo.");
      return;
    }

    const validationError = isValidPhoto(selectedFile);
    if (validationError) {
      setModalError(validationError);
      return;
    }

    try {
      setUploading(true);
      setModalError("");
      setUploadNote("");

      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("eventId", selectedEventId);

      const r = await fetch("/api/events/photos", {
        method: "POST",
        body: formData,
      });

      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d?.error || "Upload failed");
      }

      await loadEventGalleries();
      resetUploadModal();
      setUploadNote("Photo uploaded successfully.");
      setTimeout(() => setUploadNote(""), 2600);
    } catch (err: any) {
      setModalError(err?.message || "Unable to upload photo.");
      setUploadNote("");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateEvent() {
    if (!canCreateEvent) {
      setCreateEventMode(false);
      setModalError("Only HR can create events.");
      return;
    }

    const eventName = eventForm.eventName.trim();
    if (!eventName) {
      setModalError("Event name is required.");
      return;
    }

    try {
      setCreatingEvent(true);
      setModalError("");

      const r = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventType: eventForm.eventType.trim(),
          eventDate: eventForm.eventDate.trim(),
          location: eventForm.location.trim(),
          description: eventForm.description.trim(),
        }),
      });

      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(d?.error || "Unable to create event.");
      }

      const created = d?.event;
      if (!created?.eventId) {
        throw new Error("Unable to create event.");
      }

      const newOption: EventOption = {
        eventId: created.eventId,
        eventName: created.eventName,
      };

      setEventOptions((prev) => {
        if (prev.some((event) => event.eventId === newOption.eventId)) return prev;
        return [newOption, ...prev];
      });
      setSelectedEventId(String(created.eventId));
      setCreateEventMode(false);
      setEventForm({
        eventName: "",
        eventType: "",
        eventDate: "",
        location: "",
        description: "",
      });
    } catch (err: any) {
      setModalError(err?.message || "Unable to create event.");
    } finally {
      setCreatingEvent(false);
    }
  }

  const confettiColors = ["#F26522","#1F3A68","#475569","#F8F4EF","#d97745","#2f4d7f","#8fa1bb","#f3ded1"];
  const shapes = ["circle","square","ribbon"];

  function spawnConfetti() {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 0.6,
      dur: 1.2 + Math.random() * 0.8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2800);
  }

  useEffect(() => {
    if (featuredPhotos.length <= 1) return;
    const iv = setInterval(
      () => setCurrentIndex((p) => (p + 1) % featuredPhotos.length),
      5000,
    );
    return () => clearInterval(iv);
  }, [featuredPhotos.length]);

  useEffect(() => {
    loadEventGalleries();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) {
          closeLightbox();
          return;
        }
        if (uploadModalOpen) {
          if (createEventMode) {
            setCreateEventMode(false);
            setModalError("");
          } else {
            resetUploadModal();
          }
          return;
        }
      }
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") {
        setLightboxIndex((p) =>
          p === null || eventImages.length === 0
            ? p
            : (p - 1 + eventImages.length) % eventImages.length,
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((p) =>
          p === null || eventImages.length === 0
            ? p
            : (p + 1) % eventImages.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, eventImages.length, uploadModalOpen, createEventMode]);

  useEffect(() => {
    (async () => { try { const r = await fetch("/api/birthdays"); setBirthdays(await r.json()); } catch {} finally { setBdayLoading(false); } })();
  }, []);

  useEffect(() => {
    (async () => { try { const r = await fetch("/api/me"); setUser(await r.json()); } catch {} })();
  }, []);

  // Spawn confetti when modal opens
  useEffect(() => {
    if (selectedPerson) spawnConfetti();
  }, [selectedPerson]);

  const avatarColors = [
    "#1F3A68",
    "#F26522",
    "#475569",
    "#1F3A68",
    "#475569",
  ];

  function formatBdayDate(dob: string) {
    try {
      const d = new Date(dob);
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const day = String(d.getDate()).padStart(2, "0");
      return `${month}-${day}`;
    } catch { return dob; }
  }

  // Check if a birthday is today
  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  function isTodayBirthday(dob: string) {
    try {
      const d = new Date(dob);
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) === todayStr;
    } catch { return false; }
  }

  return (
    <aside className="right-panel">
      {/* ======= EVENTS CAROUSEL ======= */}
        <div className="panel-card events-card">
          <div className="card-decor"><div className="cd-orb cd-orb-1" /></div>
          <div className="card-header">
            <h3>Life at Adroitent</h3>
            <button className="gallery-link" onClick={() => openLightboxBySrc(featuredEventImage)}>Gallery</button>
          </div>

        <div className="event-gallery-layout">
          <div className="event-feature-tile" onClick={() => openLightboxBySrc(featuredEventImage)}>
            {!carouselReady && <div className="carousel-skeleton" />}
            {featuredEventImage ? (
              <div className="carousel-image-layer" key={featuredEventImage}>
                <Image src={featuredEventImage} alt={eventHighlights[0].title || "event"} fill priority style={{ objectFit: "cover" }} onLoad={() => setCarouselReady(true)} />
              </div>
            ) : null}
            <div className="event-overlay" />
            <div className="event-caption">
              <p className="event-title">{eventHighlights[0].title}</p>
              <p className="event-meta">{eventHighlights[0].meta}</p>
            </div>
          </div>

          <div className="event-subgrid">
            <div className="event-mini-tile event-mini-left" onClick={() => openLightboxBySrc(diwaliEventImage)}>
              {diwaliEventImage ? (
                <div className="carousel-image-layer" key={diwaliEventImage}>
                  <Image src={diwaliEventImage} alt={eventHighlights[1].title || "event"} fill style={{ objectFit: "cover" }} />
                </div>
              ) : null}
              <div className="event-overlay" />
              <div className="event-caption mini">
                <p className="event-title">{eventHighlights[1].title}</p>
                <p className="event-meta">{eventHighlights[1].meta}</p>
              </div>
            </div>

            <div className="event-mini-tile event-mini-right" onClick={() => openLightboxBySrc(dussehraSecondaryEventImage)}>
              {dussehraSecondaryEventImage ? (
                <div className="carousel-image-layer" key={dussehraSecondaryEventImage}>
                  <Image src={dussehraSecondaryEventImage} alt={eventHighlights[2].title || "event"} fill style={{ objectFit: "cover" }} />
                </div>
              ) : null}
              <div className="event-overlay light" />
              <div className="event-caption mini dark">
                <p className="event-title">{eventHighlights[2].title}</p>
                <p className="event-meta">{eventHighlights[2].meta}</p>
              </div>
            </div>
          </div>

          <button className="share-tile" onClick={openUploadModal}>
            {uploading ? "Uploading..." : "+ Share a photo or video"}
          </button>
          {!!uploadNote && <p className="upload-note">{uploadNote}</p>}
        </div>
      </div>

      {/* ======= BIRTHDAYS ======= */}
      <div className="panel-card birthday-card">
        <div className="card-decor"><div className="cd-orb cd-orb-2" /></div>
        <div className="card-header">
          <h3>
            <Cake size={18} className="header-icon cake-icon" />
            Upcoming Birthdays
          </h3>
        </div>
        <div className="bday-list">
          {bdayLoading
            ? [0, 1, 2, 3, 4].map(i => (
                <div key={i} className="bday-row skeleton-row">
                  <div className="skeleton-avatar skeleton-pulse" />
                  <div className="bday-info">
                    <div className="skeleton-line skeleton-pulse" style={{ width: "60%", height: 12, borderRadius: 4, marginBottom: 6 }} />
                    <div className="skeleton-line skeleton-pulse" style={{ width: "35%", height: 10, borderRadius: 4 }} />
                  </div>
                </div>
              ))
            : birthdays.slice(0, 5).map((person, idx) => {
                const isToday = isTodayBirthday(person.date_of_birth);
                return (
                  <div
                    key={person.slno}
                    className={`bday-row ${isToday ? "today" : ""}`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                      {person.employee.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </div>
                    <div className="bday-info">
                      <span className="bday-name">{person.employee}</span>
                      <span className="bday-date">{formatBdayDate(person.date_of_birth)}</span>
                    </div>
                    {isToday
                      ? <span className="today-badge"><PartyPopper size={13} className="today-icon" /> Today!</span>
                      : <button className="wish-btn"><Gift size={16} color="#F26522" /></button>
                    }
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* ======= MODAL WITH CONFETTI ======= */}
      {selectedPerson && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          {/* Confetti layer */}
          <div className="confetti-stage">
            {confetti.map(p => (
              <div
                key={p.id}
                className={`conf-piece ${p.shape}`}
                style={{
                  left: `${p.x}%`,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.dur}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* Ribbon decorations */}
            <div className="ribbon ribbon-left" />
            <div className="ribbon ribbon-right" />

            <div className="modal-icon-wrap">
              <div className="modal-icon-ring" />
              <span className="modal-icon">
                <Cake size={40} color="#F26522" strokeWidth={1.8} />
              </span>
            </div>
            <h4>Send Birthday Wishes?</h4>
            <p>Send a birthday email to <strong>{selectedPerson.employee}</strong></p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedPerson(null)}>
                <X size={14} className="btn-icon" /> Cancel
              </button>
              <button
                className="btn-send"
                onClick={() => {
                  if (!user) return;
                  const subject = "Happy Birthday!";
                  const body = `Dear ${selectedPerson.employee},\n\nWishing you a very Happy Birthday!\n\nMay this year bring you happiness, success, and good health.\n\nHave a fantastic celebration!\n\nWarm regards,\n${user.username}`;
                  window.location.href = `mailto:${selectedPerson.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  setSelectedPerson(null);
                }}
              >
                <Mail size={15} className="btn-icon" /> Send Email
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {uploadModalOpen && createPortal(
        <div className="modal-overlay" onClick={resetUploadModal}>
          <div className="modal upload-modal" onClick={(e) => e.stopPropagation()}>
            {createEventMode && canCreateEvent ? (
              <>
                <h4>Create New Event</h4>
                <div className="upload-form">
                  <label className="upload-label">
                    Event Name
                    <input
                      className="upload-input"
                      type="text"
                      maxLength={150}
                      value={eventForm.eventName}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, eventName: e.target.value }))}
                      placeholder="Annual Sports Day 2026"
                    />
                  </label>
                  <label className="upload-label">
                    Event Type
                    <input
                      className="upload-input"
                      type="text"
                      maxLength={50}
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, eventType: e.target.value }))}
                      placeholder="Sports"
                    />
                  </label>
                  <label className="upload-label">
                    Event Date
                    <input
                      className="upload-input"
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </label>
                  <label className="upload-label">
                    Location
                    <input
                      className="upload-input"
                      type="text"
                      maxLength={150}
                      value={eventForm.location}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Hyderabad"
                    />
                  </label>
                  <label className="upload-label">
                    Description
                    <textarea
                      className="upload-input upload-textarea"
                      maxLength={500}
                      value={eventForm.description}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Annual company sports event"
                    />
                  </label>
                  {!!modalError && <p className="upload-error">{modalError}</p>}
                  <div className="modal-actions">
                    <button
                      className="btn-cancel"
                      type="button"
                      onClick={() => {
                        setCreateEventMode(false);
                        setModalError("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-send"
                      type="button"
                      onClick={handleCreateEvent}
                      disabled={creatingEvent || !eventForm.eventName.trim()}
                    >
                      {creatingEvent ? "Creating..." : "Create Event"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h4>Share a photo</h4>
                <div className="upload-form">
                  <label className="upload-label">
                    Event
                    <select
                      className="upload-input"
                      value={selectedEventId}
                      onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setModalError("");
                      }}
                      disabled={loadingEvents}
                    >
                      <option value="">
                        {loadingEvents ? "Loading events..." : "Select an event"}
                      </option>
                      {eventOptions.map((event) => (
                        <option key={event.eventId} value={event.eventId}>
                          {event.eventName}
                        </option>
                      ))}
                    </select>
                  </label>
                  {canCreateEvent && (
                    <button
                      type="button"
                      className="create-event-btn"
                      onClick={() => {
                        setCreateEventMode(true);
                        setModalError("");
                      }}
                    >
                      + Create New Event
                    </button>
                  )}
                  <label className="upload-label">
                    Photo
                    <input
                      ref={fileInputRef}
                      className="upload-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) {
                          setSelectedFile(null);
                          return;
                        }
                        const error = isValidPhoto(file);
                        if (error) {
                          setSelectedFile(null);
                          setModalError(error);
                          e.currentTarget.value = "";
                          return;
                        }
                        setSelectedFile(file);
                        setModalError("");
                      }}
                    />
                  </label>
                  {!!modalError && <p className="upload-error">{modalError}</p>}
                  <div className="modal-actions">
                    <button className="btn-cancel" type="button" onClick={resetUploadModal}>
                      Cancel
                    </button>
                    <button
                      className="btn-send"
                      type="button"
                      onClick={handlePhotoUpload}
                      disabled={!canUpload || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}

      {activeLightboxImage && createPortal(
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-nav left" onClick={(e) => showPrevLightbox(e)} aria-label="Previous image">‹</button>
          <img src={activeLightboxImage} alt="event" className="lightbox-img" onClick={e => e.stopPropagation()} />
          <button className="lightbox-nav right" onClick={(e) => showNextLightbox(e)} aria-label="Next image">›</button>
          <div className="lightbox-counter">
            {(lightboxIndex ?? 0) + 1}/{eventImages.length}
          </div>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
        </div>,
        document.body,
      )}

      <style jsx>{`
        .right-panel {
          width: var(--right-w, 340px);
          max-width:  340px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        @media (max-width: 1024px) {
  .right-panel {
    display: none;
  }
}
        .right-panel::-webkit-scrollbar { width: 0; }

        .panel-card {
          position: relative;
          padding: 18px;
          border-radius: var(--radius-lg);
          border: 1px solid #e4ddd3;
          overflow: hidden;
          background: var(--bg-card);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 8px 20px rgba(31, 58, 104, 0.08);
          transition: transform 240ms ease, box-shadow 240ms ease;
          transform: translate3d(0, 10px, 0);
          opacity: 0;
          animation: panelEnter 0.45s ease forwards;
        }
        .events-card {
          animation-delay: 200ms;
        }
        .birthday-card {
          animation-delay: 300ms;
        }
        @keyframes panelEnter {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .panel-card:hover {
          box-shadow: 0 16px 30px rgba(31, 58, 104, 0.12);
          transform: translate3d(0, -4px, 0);
        }

        .card-decor { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: inherit; }
        .cd-orb { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.2; }
        .cd-orb-1 { width: 120px; height: 120px; background: rgba(242,101,34,0.16); top: -30px; right: -20px; animation: none; }
        .cd-orb-2 { width: 100px; height: 100px; background: rgba(31,58,104,0.12); bottom: -20px; left: -10px; animation: none; }
        @keyframes orbFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,6px); } }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; position: relative; z-index: 1; }
        .card-header h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 7px; }
        .badge { font-size: 11px; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 4px 10px; border-radius: 999px; }
        .gallery-link {
          border: none;
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .gallery-link:hover { opacity: 0.8; }

        /* header icons */
        .card-header h3 :global(.cake-icon) {
          color: #F26522;
          flex-shrink: 0;
        }

        /* events gallery */
        .event-gallery-layout {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .event-feature-tile,
        .event-mini-tile {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #ece4d8;
          background: #f8f4ef;
          cursor: pointer;
        }
        .event-feature-tile {
          height: 165px;
        }
        .event-subgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .event-mini-tile {
          height: 80px;
        }
        .event-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.1));
          z-index: 1;
          pointer-events: none;
        }
        .event-overlay.light {
          background: linear-gradient(to top, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.06));
        }
        .event-caption {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 9px;
          z-index: 2;
        }
        .event-caption.mini {
          bottom: 7px;
        }
        .event-caption.dark .event-title,
        .event-caption.dark .event-meta {
          color: #1f3a68;
        }
        .event-title {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.25;
        }
        .event-meta {
          margin: 2px 0 0;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }
        .event-caption.mini .event-title {
          font-size: 12px;
        }
        .event-caption.mini .event-meta {
          font-size: 11px;
        }
        .play-badge {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(31, 58, 104, 0.8);
          color: #ffffff;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .share-tile {
          height: 44px;
          border-radius: 10px;
          border: 1px dashed #d8cfc2;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 180ms ease, background 180ms ease;
        }
        .share-tile:hover {
          border-color: rgba(242, 101, 34, 0.5);
          background: rgba(242, 101, 34, 0.05);
        }
        .upload-note {
          margin: 6px 4px 0;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .upload-modal {
          text-align: left;
          width: 380px;
        }
        .upload-modal h4 {
          text-align: left;
        }
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .upload-label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .upload-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--border, #ece4d8);
          background: var(--bg-card-solid, #fff);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 500;
        }
        .upload-textarea {
          min-height: 72px;
          resize: vertical;
        }
        .create-event-btn {
          align-self: flex-start;
          border: none;
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }
        .create-event-btn:hover { opacity: 0.8; }
        .upload-error {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #c2410c;
        }

        .carousel-image-layer {
          position: absolute;
          inset: 0;
          animation: carouselFadeIn 420ms ease;
          will-change: opacity, transform;
        }
        @keyframes carouselFadeIn {
          from {
            opacity: 0.12;
            transform: scale(1.01);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes skeletonShimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-pulse {
          background: linear-gradient(90deg, var(--bg-soft) 25%, var(--bg-soft-hover) 50%, var(--bg-soft) 75%);
          background-size: 800px 100%;
          animation: skeletonShimmer 1.4s ease-in-out infinite;
        }
        .skeleton-row { pointer-events: none; border: 1px solid transparent !important; }
        .skeleton-avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; }
        .skeleton-line { display: block; }
        .carousel-skeleton {
          position: absolute; inset: 0; z-index: 3; border-radius: inherit;
          background: linear-gradient(90deg, var(--bg-soft) 25%, var(--bg-soft-hover) 50%, var(--bg-soft) 75%);
          background-size: 800px 100%;
          animation: skeletonShimmer 1.4s ease-in-out infinite;
        }
        /* birthdays */
        .bday-list { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
        .bday-row { display: flex; align-items: center; gap: 12px; padding: 6px 12px; border-radius: var(--radius-sm); background: #ffffff; border: 1px solid #ece4d8; cursor: pointer; transition: background 220ms ease, border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease; }
        .bday-row:hover { background: rgba(242, 101, 34, 0.09); border-color: rgba(242, 101, 34, 0.24); transform: translate3d(0, -1px, 0); box-shadow: 0 8px 18px rgba(31, 58, 104, 0.08); }
        .bday-row.today { background: rgba(242,101,34,0.12); border-color: rgba(242,101,34,0.28); animation: todayPulse 2.8s ease-in-out infinite; }
        @keyframes todayPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(242,101,34,0.18); } 50% { box-shadow: 0 0 0 6px rgba(242,101,34,0); } }
        .bday-row:hover .wish-btn { opacity: 1; transform: scale(1); }

        .avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; flex-shrink: 0; transition: transform 220ms ease; }
        .bday-row:hover .avatar { transform: scale(1.08); }
        .view-all-birthdays { text-align: center; padding-top: 10px; }
        .view-all-link { font-size: 13px; font-weight: 600; color: var(--accent); cursor: pointer; transition: opacity 0.2s ease; }
        .view-all-link:hover { opacity: 0.75; }
        .bday-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .bday-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bday-date { font-size: 12px; color: var(--text-muted); }
        .wish-btn { width: 34px; height: 32px; border-radius: 10px; border: 1px solid #ece4d8; background: var(--bg-card-solid); font-size: 16px; cursor: pointer; opacity: 0; transform: scale(0.8); transition: all 0.2s ease; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center; }
        .wish-btn:hover { background: rgba(242,101,34,0.12); }
        .wish-btn :global(svg) { transition: transform 220ms ease; }
        .bday-row:hover .wish-btn :global(svg) { transform: rotate(-10deg); }

        :global(html[data-theme="dark"]) .panel-card {
          background: #123a78;
          border-color: rgba(169, 198, 245, 0.22);
          box-shadow: 0 10px 24px rgba(7, 20, 49, 0.36);
        }
        :global(html[data-theme="dark"]) .card-header h3 {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .badge {
          background: rgba(242, 101, 34, 0.22);
          color: #ffd5c1;
        }
        :global(html[data-theme="dark"]) .gallery-link {
          color: #ffd5c1;
        }
        :global(html[data-theme="dark"]) .event-feature-tile,
        :global(html[data-theme="dark"]) .event-mini-tile {
          border-color: rgba(188, 211, 248, 0.24);
        }
        :global(html[data-theme="dark"]) .share-tile {
          border-color: rgba(188, 211, 248, 0.34);
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .share-tile:hover {
          border-color: rgba(242, 101, 34, 0.62);
          background: rgba(242, 101, 34, 0.16);
        }
        :global(html[data-theme="dark"]) .upload-note {
          color: #d6e6ff;
        }
        :global(html[data-theme="dark"]) .upload-label {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .upload-input {
          background: #173f7f;
          border-color: rgba(188, 211, 248, 0.24);
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .create-event-btn {
          color: #ffd5c1;
        }
        :global(html[data-theme="dark"]) .upload-error {
          color: #ffd5c1;
        }
        :global(html[data-theme="dark"]) .event-caption.dark .event-title,
        :global(html[data-theme="dark"]) .event-caption.dark .event-meta {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .bday-row {
          background: #1f4a8f;
          border-color: rgba(188, 211, 248, 0.2);
        }
        :global(html[data-theme="dark"]) .bday-row:hover {
          background: #28569f;
          border-color: rgba(211, 226, 250, 0.34);
        }
        :global(html[data-theme="dark"]) .bday-name {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .bday-date {
          color: #d6e6ff;
        }
        :global(html[data-theme="dark"]) .wish-btn {
          background: #173f7f;
          border: 1px solid rgba(188, 211, 248, 0.24);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }

          .panel-card {
            opacity: 1;
            transform: none;
          }
        }
        .today-badge { font-size: 11px; font-weight: 700; color: var(--accent); background: var(--accent-light); padding: 3px 8px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; gap: 3px; animation: badgePulse 3s ease-in-out infinite; }
        @keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .today-badge :global(.today-icon) { color: #F26522; }

        /* ======= CONFETTI ======= */
        .confetti-stage { position: fixed; inset: 0; pointer-events: none; z-index: 10000; overflow: hidden; }
        .conf-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 10px;
          opacity: 0;
          animation: confettiFall linear forwards;
        }
        .conf-piece.circle { border-radius: 50%; }
        .conf-piece.square { border-radius: 2px; }
        .conf-piece.ribbon { width: 4px; height: 14px; border-radius: 2px; }

        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.5); }
        }

        /* ======= MODAL ======= */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: var(--bg-card-solid);
          padding: 32px 28px 28px;
          border-radius: 20px;
          width: 360px;
          max-width: calc(100vw - 32px);
          text-align: center;
          box-shadow: 0 20px 60px rgba(31,58,104,0.2), var(--shadow-lg);
          animation: modalUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(31,58,104,0.16);
        }
        @keyframes modalUp { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* Ribbon decorations on modal corners */
        .ribbon {
          position: absolute;
          top: 0;
          width: 80px;
          height: 80px;
          overflow: hidden;
          pointer-events: none;
        }
        .ribbon-left { left: 0; }
        .ribbon-right { right: 0; transform: scaleX(-1); }
        .ribbon::before, .ribbon::after {
          content: "";
          position: absolute;
          border-style: solid;
        }
        .ribbon::before {
          top: 0; left: 0;
          border-width: 40px;
          border-color: rgba(242,101,34,0.18) transparent transparent rgba(242,101,34,0.18);
        }
        .ribbon::after {
          top: 2px; left: 2px;
          border-width: 38px;
          border-color: rgba(31,58,104,0.08) transparent transparent rgba(31,58,104,0.08);
        }

        .modal-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          width: 64px;
          height: 64px;
        }
        .modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
        }
        @keyframes iconBounce { from { transform: scale(0) rotate(-20deg); } to { transform: scale(1) rotate(0deg); } }

        .modal-icon-ring {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: rgba(242,101,34,0.5);
          border-right-color: rgba(31,58,104,0.3);
          animation: iconSpin 3s linear infinite;
        }
        @keyframes iconSpin { to { transform: rotate(360deg); } }

        .modal h4 { margin: 0 0 8px; font-size: 19px; font-weight: 800; color: var(--text-primary); }
        .modal p { font-size: 14px; margin-bottom: 22px; color: var(--text-secondary); line-height: 1.5; }
        .modal-actions { display: flex; gap: 10px; }

        .btn-cancel {
          flex: 1; background: var(--bg-soft); border: 1px solid var(--border); padding: 11px; border-radius: var(--radius-sm);
          cursor: pointer; font-weight: 600; font-size: 13px; color: var(--text-secondary); transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
        }
        .btn-cancel:hover { background: var(--bg-soft-hover); }
        .btn-cancel :global(.btn-icon) { color: var(--text-secondary); }

        .btn-send {
          flex: 1; background: #F26522; color: white; border: none;
          padding: 11px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;
          font-size: 13px; box-shadow: 0 4px 14px rgba(31,58,104,0.3); transition: all 0.25s ease;
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
        }
        .btn-send :global(.btn-icon) { color: white; }
        .btn-send::after {
          content: ""; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: transparent;
          animation: none;
        }
        @keyframes btnShine { 0%,60% { left: -100%; } 100% { left: 150%; } }
        .btn-send:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(242,101,34,0.35); }
        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* ===== LIGHTBOX ===== */
        .lightbox-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.88);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000; animation: fadeIn 0.2s ease; cursor: pointer;
        }
        .lightbox-img {
          max-width: 90vw; max-height: 88vh; border-radius: 12px;
          object-fit: contain; box-shadow: 0 24px 64px rgba(0,0,0,0.6);
          animation: lightboxIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          cursor: default;
        }
        .lightbox-nav {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.32);
          color: white;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          transition: background 0.2s ease;
        }
        .lightbox-nav:hover { background: rgba(255,255,255,0.32); }
        .lightbox-nav.left { left: 22px; }
        .lightbox-nav.right { right: 22px; }
        .lightbox-counter {
          position: fixed;
          top: 22px;
          left: 24px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          z-index: 10001;
        }
        @keyframes lightboxIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .lightbox-close {
          position: fixed; top: 20px; right: 24px;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          border: none; color: white; font-size: 26px; line-height: 1;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s ease;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.28); }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .right-panel {
            width: 100%;
            max-width: 100%;
            height: auto;
            overflow: visible;
          }

          .event-feature-tile {
            height: 175px;
          }
          .event-subgrid {
            gap: 8px;
          }
          .event-mini-tile {
            height: 76px;
          }
          .share-tile {
            height: 42px;
            font-size: 13px;
          }
          .lightbox-nav {
            width: 38px;
            height: 38px;
            font-size: 24px;
          }
          .lightbox-nav.left { left: 10px; }
          .lightbox-nav.right { right: 10px; }
          .lightbox-counter {
            top: 14px;
            left: 14px;
            font-size: 11px;
            padding: 5px 10px;
          }

          .wish-btn {
            opacity: 0.6;
            transform: scale(1);
          }
        }
      `}</style>
    </aside>
  );
}
