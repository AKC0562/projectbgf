function CompanionLanguages({
  languages = [],
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((language) => (
        <span
          key={language}
          className="rounded-lg border border-purple-800/40 bg-[#1e0e38] px-3 py-2 text-sm text-purple-200"
        >
          {language}
        </span>
      ))}
    </div>
  );
}

export default CompanionLanguages;