import { useEffect } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { FiMapPin } from 'react-icons/fi';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  required?: boolean;
  placeholder?: string;
}

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  required = false,
  placeholder
}: LocationAutocompleteProps) {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'CA' },
    },
    debounce: 300,
    defaultValue: value,
    initOnMount: !!window.google,
  });

  useEffect(() => {
    setValue(value, false);
  }, [value, setValue]);

  const handleSelect = async (address: string) => {
    setValue(address, false);
    onChange(address);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onChange(address, { lat, lng });
    } catch (error) {
      console.error('Error getting coordinates:', error);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          disabled={!ready}
          required={required}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {status === "OK" && (
          <ul className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelect(description)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 