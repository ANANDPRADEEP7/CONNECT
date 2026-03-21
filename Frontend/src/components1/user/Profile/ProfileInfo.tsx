interface ProfileField {
  label: string;
  value: string;
}

interface ProfileInfoProps {
  fields: ProfileField[];
}

const ProfileInfo = ({ fields }: ProfileInfoProps) => (
  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
    {fields.map((field, i) => (
      <div key={i}>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">{field.label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{field.value}</p>
      </div>
    ))}
  </div>
);

export default ProfileInfo;
