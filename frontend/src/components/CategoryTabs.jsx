export default function CategoryTabs({ selectedCategory, onCategoryChange }) {
  const categories = [
    { id: '전체', name: '전체' },
    { id: '스킨케어', name: '스킨케어' },
    { id: '마스크팩', name: '마스크팩' },
    { id: '클렌징', name: '클렌징' },
    { id: '선케어', name: '선케어' },
    { id: '헤어케어', name: '헤어케어' }
  ];

  return (
    <div className="border-b border-border mb-6">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-6 py-3 font-medium whitespace-nowrap transition-all
                ${
                  isSelected
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text border-b-2 border-transparent hover:border-border'
                }
              `}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
