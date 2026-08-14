'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  botStudioCheckSession,
  botStudioLogin,
  botStudioLogout,
  createBotTopic,
  deleteBotTopic,
  getBotBasics,
  getBotGeminiUsage,
  getBotLineUsage,
  getBotPersona,
  listBotTopics,
  reorderBotTopics,
  updateBotPersona,
  updateBotTopic,
} from '@/lib/api';
import type {
  BotBasicsPreview,
  BotGeminiUsage,
  BotKnowledgeTopic,
  BotLineUsage,
  BotPersona,
} from '@/types';

type Tab = 'persona' | 'knowledge' | 'basics' | 'usage';

const inputClass =
  'w-full rounded-lg border border-[#d8e0d4] bg-white px-3 py-2.5 text-sm text-[#1a3228] outline-none focus:border-[#6b7c5e]';
const labelClass = 'mb-1.5 block text-xs font-medium text-[#5a6b55]';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-[#6b7c5e] px-4 py-2.5 text-sm text-white transition hover:bg-[#1a3228] disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-[#d8e0d4] px-3 py-2 text-sm text-[#5a6b55] transition hover:border-[#6b7c5e] hover:text-[#1a3228] disabled:opacity-50';

export default function BotStudioPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<Tab>('persona');

  useEffect(() => {
    botStudioCheckSession().then(setAuthed);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await botStudioLogin(password);
      setAuthed(true);
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await botStudioLogout().catch(() => undefined);
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f1] text-sm text-[#8a8a8a]">
        กำลังตรวจสอบเซสชัน...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f1] p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-[340px] rounded-2xl border border-[#e5e9e0] bg-white p-10 text-center shadow-[0_8px_40px_rgba(30,58,58,0.1)]"
        >
          <h1 className="font-display mb-1 text-[1.75rem] text-[#1a3228]">Bot Studio</h1>
          <p className="mb-6 text-sm text-[#8a8a8a]">บุคลิกและความรู้ของบอท LINE</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
            required
            className={`${inputClass} mb-3`}
          />
          {loginError && (
            <p className="mb-3 text-left text-xs text-red-500">{loginError}</p>
          )}
          <button type="submit" disabled={loggingIn} className={`${btnPrimary} w-full`}>
            {loggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'persona', label: 'บุคลิก' },
    { id: 'knowledge', label: 'ความรู้' },
    { id: 'basics', label: 'ข้อมูลพื้นฐาน' },
    { id: 'usage', label: 'Usage' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f1]">
      <header className="border-b border-[#e5e9e0] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-display text-xl text-[#1a3228]">Bot Studio</h1>
            <p className="text-xs text-[#8a8a8a]">จัดการบุคลิก ความรู้ และการใช้โควตา</p>
          </div>
          <button type="button" onClick={handleLogout} className={btnGhost}>
            ออกจากระบบ
          </button>
        </div>
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
                tab === t.id
                  ? 'bg-[#6b7c5e] text-white'
                  : 'text-[#5a6b55] hover:bg-[#eef2ea]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {tab === 'persona' && <PersonaPanel />}
        {tab === 'knowledge' && <KnowledgePanel />}
        {tab === 'basics' && <BasicsPanel />}
        {tab === 'usage' && <UsagePanel />}
      </main>
    </div>
  );
}

function PersonaPanel() {
  const [form, setForm] = useState<BotPersona | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getBotPersona()
      .then(setForm)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await updateBotPersona({
        displayName: form.displayName,
        selfCallName: form.selfCallName,
        tone: form.tone,
        languageNote: form.languageNote,
        emojiPolicy: form.emojiPolicy,
        maxLength: form.maxLength,
        doNotDo: form.doNotDo,
        whenUnknown: form.whenUnknown,
      });
      setForm(updated);
      setMessage('บันทึกบุคลิกแล้ว');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <p className="text-sm text-[#8a8a8a]">{error || 'กำลังโหลด...'}</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-[#e5e9e0] bg-white p-5">
      <Field label="ชื่อที่แสดง (display name)">
        <input
          className={inputClass}
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
        />
        <p className="mt-1 text-xs text-[#8a8a8a]">
          ใช้บนหัวการ์ด Flex และปุ่ม &ldquo;คุยกับ...&rdquo;
        </p>
      </Field>
      <Field label="คำแทนตัวเองเวลาตอบ">
        <input
          className={inputClass}
          maxLength={50}
          value={form.selfCallName}
          onChange={(e) => setForm({ ...form, selfCallName: e.target.value })}
        />
        <p className="mt-1 text-xs text-[#8a8a8a]">
          บอทจะเรียกตัวเองด้วยคำนี้เสมอ และใช้เป็นตัวอย่างการพิมพ์ในการ์ดแนะนำ
        </p>
      </Field>
      <Field label="โทนการพูด">
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={form.tone}
          onChange={(e) => setForm({ ...form, tone: e.target.value })}
        />
      </Field>
      <Field label="หมายเหตุภาษา">
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={form.languageNote}
          onChange={(e) => setForm({ ...form, languageNote: e.target.value })}
        />
      </Field>
      <Field label="การใช้อีโมจิ">
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={form.emojiPolicy}
          onChange={(e) => setForm({ ...form, emojiPolicy: e.target.value })}
        />
      </Field>
      <Field label="ความยาวสูงสุด (ตัวอักษร)">
        <input
          type="number"
          min={100}
          max={900}
          className={inputClass}
          value={form.maxLength}
          onChange={(e) => setForm({ ...form, maxLength: Number(e.target.value) || 500 })}
        />
      </Field>
      <Field label="สิ่งที่ห้ามทำ">
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={form.doNotDo}
          onChange={(e) => setForm({ ...form, doNotDo: e.target.value })}
        />
      </Field>
      <Field label="เมื่อไม่รู้คำตอบ">
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={form.whenUnknown}
          onChange={(e) => setForm({ ...form, whenUnknown: e.target.value })}
        />
      </Field>
      {message && <p className="text-sm text-[#6b7c5e]">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" disabled={saving} className={btnPrimary}>
        {saving ? 'กำลังบันทึก...' : 'บันทึกบุคลิก'}
      </button>
    </form>
  );
}

function KnowledgePanel() {
  const [topics, setTopics] = useState<BotKnowledgeTopic[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setTopics(await listBotTopics());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createBotTopic({ title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เพิ่มไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setBusy(true);
    setError('');
    try {
      await updateBotTopic(id, { title: editTitle.trim(), body: editBody.trim() });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ลบหัวข้อนี้?')) return;
    setBusy(true);
    setError('');
    try {
      await deleteBotTopic(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= topics.length) return;
    const reordered = [...topics];
    const [item] = reordered.splice(index, 1);
    reordered.splice(next, 0, item);
    const items = reordered.map((t, i) => ({ id: t.id, sortOrder: i }));
    setBusy(true);
    try {
      setTopics(await reorderBotTopics(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เรียงลำดับไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-2xl border border-[#e5e9e0] bg-white p-5"
      >
        <h2 className="text-sm font-medium text-[#1a3228]">เพิ่มหัวข้อความรู้</h2>
        <Field label="หัวข้อ">
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น Dress code"
          />
        </Field>
        <Field label="เนื้อหา">
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="รายละเอียดที่บอทควรรู้"
          />
        </Field>
        <button type="submit" disabled={busy} className={btnPrimary}>
          เพิ่มหัวข้อ
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-3">
        {topics.length === 0 && (
          <p className="text-sm text-[#8a8a8a]">ยังไม่มีหัวข้อความรู้</p>
        )}
        {topics.map((topic, index) => (
          <div
            key={topic.id}
            className="rounded-2xl border border-[#e5e9e0] bg-white p-4"
          >
            {editingId === topic.id ? (
              <div className="space-y-3">
                <input
                  className={inputClass}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className={`${inputClass} min-h-[100px] resize-y`}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    className={btnPrimary}
                    onClick={() => handleSaveEdit(topic.id)}
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setEditingId(null)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-[#1a3228]">{topic.title}</h3>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className={btnGhost}
                      disabled={busy || index === 0}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={btnGhost}
                      disabled={busy || index === topics.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm text-[#5a6b55]">
                  {topic.body}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      setEditingId(topic.id);
                      setEditTitle(topic.title);
                      setEditBody(topic.body);
                    }}
                  >
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    disabled={busy}
                    onClick={() => handleDelete(topic.id)}
                  >
                    ลบ
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BasicsPanel() {
  const [basics, setBasics] = useState<BotBasicsPreview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBotBasics()
      .then(setBasics)
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดไม่สำเร็จ'));
  }, []);

  if (!basics) {
    return <p className="text-sm text-[#8a8a8a]">{error || 'กำลังโหลด...'}</p>;
  }

  const rows: { label: string; value: string }[] = [
    {
      label: 'คู่บ่าวสาว',
      value: `${basics.brideNickname} (${basics.brideName}) & ${basics.groomNickname} (${basics.groomName})`,
    },
    {
      label: 'วันงาน',
      value: new Date(basics.weddingDate).toLocaleString('th-TH', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
    },
    { label: 'สถานที่', value: basics.venue },
    { label: 'ที่อยู่', value: basics.city },
    { label: 'แผนที่', value: basics.mapsUrl },
    {
      label: 'กำหนด RSVP',
      value: new Date(basics.rsvpDeadline).toLocaleDateString('th-TH', {
        dateStyle: 'long',
      }),
    },
    { label: 'เบอร์ติดต่อ', value: basics.rsvpContactPhone },
    { label: 'LINE OA', value: basics.lineOaId },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-[#e5e9e0] bg-white p-5">
      <p className="text-sm text-[#8a8a8a]">
        อ่านอย่างเดียว — ข้อมูลจากหน้าแอดมินที่บอทจะเห็นตอนตอบแขก แก้ได้ที่ข้อมูลงานใน Admin
      </p>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-[#8a8a8a]">{row.label}</dt>
            <dd className="break-all text-sm text-[#1a3228]">{row.value}</dd>
          </div>
        ))}
      </dl>
      {(basics.brideBio || basics.groomBio) && (
        <div className="space-y-2 border-t border-[#eef2ea] pt-3">
          {basics.brideBio && (
            <div>
              <p className="text-xs text-[#8a8a8a]">Bio เจ้าสาว</p>
              <p className="whitespace-pre-wrap text-sm text-[#1a3228]">{basics.brideBio}</p>
            </div>
          )}
          {basics.groomBio && (
            <div>
              <p className="text-xs text-[#8a8a8a]">Bio เจ้าบ่าว</p>
              <p className="whitespace-pre-wrap text-sm text-[#1a3228]">{basics.groomBio}</p>
            </div>
          )}
        </div>
      )}
      <div className="border-t border-[#eef2ea] pt-3">
        <p className="mb-2 text-xs text-[#8a8a8a]">กำหนดการ</p>
        <ul className="space-y-1 text-sm text-[#1a3228]">
          {basics.timeline.map((item, i) => (
            <li key={`${item.time}-${i}`}>
              {item.time} — {item.event}
            </li>
          ))}
        </ul>
      </div>
      {basics.legacyBotKnowledge && (
        <div className="border-t border-[#eef2ea] pt-3">
          <p className="mb-1 text-xs text-[#8a8a8a]">Legacy botKnowledge (ยังใช้เป็น fallback)</p>
          <p className="whitespace-pre-wrap text-sm text-[#5a6b55]">
            {basics.legacyBotKnowledge}
          </p>
        </div>
      )}
    </div>
  );
}

function UsagePanel() {
  const [line, setLine] = useState<BotLineUsage | null>(null);
  const [gemini, setGemini] = useState<BotGeminiUsage | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const [lineData, geminiData] = await Promise.all([
        getBotLineUsage(),
        getBotGeminiUsage(),
      ]);
      setLine(lineData);
      setGemini(geminiData);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลด usage ไม่สำเร็จ');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 20_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#8a8a8a]">
          {updatedAt
            ? `อัปเดตล่าสุด ${updatedAt.toLocaleTimeString('th-TH')}`
            : 'กำลังโหลด...'}
          {' · '}รีเฟรชอัตโนมัติทุก 20 วินาที
        </p>
        <button type="button" className={btnGhost} disabled={refreshing} onClick={refresh}>
          {refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-2xl border border-[#e5e9e0] bg-white p-5">
        <h2 className="mb-3 text-sm font-medium text-[#1a3228]">LINE Message Quota</h2>
        {!line ? (
          <p className="text-sm text-[#8a8a8a]">กำลังโหลด...</p>
        ) : line.error ? (
          <p className="text-sm text-red-500">{line.error}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-3">
            <Stat label="Limit" value={formatNum(line.limit)} note={line.type ?? undefined} />
            <Stat label="Used" value={formatNum(line.used)} />
            <Stat label="Remaining" value={formatNum(line.remaining)} />
          </dl>
        )}
      </div>

      <div className="rounded-2xl border border-[#e5e9e0] bg-white p-5">
        <h2 className="mb-3 text-sm font-medium text-[#1a3228]">Gemini Usage (จาก log)</h2>
        {!gemini ? (
          <p className="text-sm text-[#8a8a8a]">กำลังโหลด...</p>
        ) : (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <UsageBlock title="วันนี้" data={gemini.today} />
              <UsageBlock title="เดือนนี้" data={gemini.month} />
            </div>
            <p className="mb-2 text-xs text-[#8a8a8a]">{gemini.billingNote}</p>
            <a
              href={gemini.aiStudioUsageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#6b7c5e] underline hover:text-[#1a3228]"
            >
              เปิด Google AI Studio Usage
            </a>
            {gemini.recent.length > 0 && (
              <div className="mt-4 border-t border-[#eef2ea] pt-3">
                <p className="mb-2 text-xs text-[#8a8a8a]">Reply ล่าสุด</p>
                <ul className="space-y-1.5 text-xs text-[#5a6b55]">
                  {gemini.recent.map((row) => (
                    <li key={row.id} className="flex justify-between gap-3">
                      <span>
                        {new Date(row.createdAt).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </span>
                      <span>
                        {row.totalTokens ?? '—'} tokens
                        {row.promptTokens != null &&
                          ` (p${row.promptTokens}/c${row.completionTokens ?? 0})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UsageBlock({
  title,
  data,
}: {
  title: string;
  data: { replies: number; promptTokens: number; completionTokens: number; totalTokens: number };
}) {
  return (
    <div className="rounded-xl bg-[#f7f9f5] p-3">
      <p className="mb-2 text-xs text-[#8a8a8a]">{title}</p>
      <p className="text-lg text-[#1a3228]">{data.replies} replies</p>
      <p className="text-xs text-[#5a6b55]">
        tokens {data.totalTokens} (prompt {data.promptTokens} / completion {data.completionTokens})
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-[#8a8a8a]">{label}</dt>
      <dd className="text-lg text-[#1a3228]">{value}</dd>
      {note && <p className="text-[0.7rem] text-[#8a8a8a]">type: {note}</p>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function formatNum(n: number | null): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('th-TH');
}
