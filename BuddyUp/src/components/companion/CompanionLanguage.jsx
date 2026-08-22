function CompanionLanguages({
  languages = [],
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((language) => (
        <span
          key={language}
          className="rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-300"
        >
          {language}
        </span>
      ))}
    </div>
  );
}

export default CompanionLanguages;