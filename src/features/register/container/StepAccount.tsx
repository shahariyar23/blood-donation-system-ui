import { useEffect, useState } from "react";
import type { RegisterFormData } from "../service/register.type";
import { Field } from "./Field";
import { NavBtns } from "./NextBtn";
import { styles } from "./style";

export function StepAccount({
  form,
  errors,
  strength,
  set,
  setFieldRef,
  handleInputKeyDown,
  onNext,
}: {
  form: RegisterFormData;
  errors: Record<string, string>;
  strength: { score: number; color: string; label: string };
  set: (field: string, value: any) => void;
  setFieldRef: (key: string) => (el: HTMLInputElement | null) => void;
  handleInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, currentKey: string) => void;
  onNext: () => void;
}) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!form.avatar) {
      setAvatarPreview(null);
      return;
    }

    const url = URL.createObjectURL(form.avatar);
    setAvatarPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.avatar]);

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Personal details</div>

      <div style={styles.grid2}>
        <Field label="Full name" error={errors.name}>
          <input
            ref={setFieldRef("name")}
            name="name"
            style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "name")}
            placeholder="Mostak Ahmed"
          />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input
            ref={setFieldRef("phone")}
            name="phone"
            style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "phone")}
            placeholder="01712345678"
          />
        </Field>
      </div>

      <Field label="Email address" error={errors.email}>
        <input
          ref={setFieldRef("email")}
          name="email"
          style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          onKeyDown={(e) => handleInputKeyDown(e, "email")}
          placeholder="mostak@gmail.com"
        />
      </Field>

      <Field label="Avatar (optional)" error={errors.avatar}>
        <div style={styles.avatarCard}>
          <div style={styles.avatarPreviewWrap}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={styles.avatarPreview}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                Upload
                <br />
                photo
              </div>
            )}
          </div>
          <div style={styles.avatarInfo}>
            <div style={styles.avatarTitle}>Profile photo</div>
            <div style={styles.avatarSub}>PNG or JPG, up to 2MB</div>
            <label style={styles.avatarButton}>
              <input
                ref={setFieldRef("avatar")}
                name="avatar"
                style={styles.avatarInput}
                type="file"
                accept="image/*"
                onChange={(e) => set("avatar", e.target.files?.[0] ?? null)}
                onKeyDown={(e) => handleInputKeyDown(e, "avatar")}
              />
              Choose photo
            </label>
            {form.avatar?.name && (
              <span style={styles.avatarName}>{form.avatar.name}</span>
            )}
          </div>
        </div>
      </Field>

      <div style={styles.grid2}>
        <Field label="Password" error={errors.password}>
          <input
            ref={setFieldRef("password")}
            name="password"
            style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "password")}
            placeholder="Min 8 characters"
          />
          {form.password && (
            <>
              <div style={{ display: "flex", gap: "3px", marginTop: "6px" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "3px",
                      borderRadius: "2px",
                      background: i <= strength.score ? strength.color : "#E8E2DA",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: "11px", color: strength.color, marginTop: "3px" }}>
                {strength.label}
              </div>
            </>
          )}
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <input
            ref={setFieldRef("confirmPassword")}
            name="confirmPassword"
            style={{ ...styles.input, ...(errors.confirmPassword ? styles.inputError : {}) }}
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, "confirmPassword")}
            placeholder="Re-enter password"
          />
        </Field>
      </div>

      <NavBtns onNext={onNext} showBack={false} />
    </div>
  );
}