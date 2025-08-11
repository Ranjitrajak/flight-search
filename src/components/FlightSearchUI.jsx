import React, { useMemo, useState } from 'react';
import { AIRPORTS } from '../data/airports';
import { Plane, ArrowUpDown, Users, Globe, X, Search } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

const FlightSearchUI = () => {
  const [activeTab, setActiveTab] = useState('domestic');
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [tripType, setTripType] = useState('round-trip');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [isAirportPickerOpen, setAirportPickerOpen] = useState(false);
  const [airportPickerFor, setAirportPickerFor] = useState(null); // 'from' | 'to'
  // Removed airportSearch state
  const [selectedTravelClass, setSelectedTravelClass] = useState('Economy Class + Class J');
  const [selectedDiscount, setSelectedDiscount] = useState('JAL CARD');

  const [isClassDialogOpen, setClassDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [isPassengerDialogOpen, setPassengerDialogOpen] = useState(false);

  // New state for the grouped airport dialog
  const [selectedGroup, setSelectedGroup] = useState('Major Cities');

  const swapAirports = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const handleInputClick = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const openAirportPicker = (which) => {
    setAirportPickerFor(which);
    setAirportPickerOpen(true);
    // No need to reset airportSearch as it's removed
    setIsExpanded(true);
  };

  const selectAirport = (airport) => {
    const label = airport.label;
    if (airportPickerFor === 'from') {
      setFromAirport(label);
    } else if (airportPickerFor === 'to') {
      setToAirport(label);
    }
    setAirportPickerOpen(false);
    setAirportPickerFor(null);
  };

  // UseMemo to create the grouped airport structure based on the provided data
  const groupedAirports = useMemo(() => {
    const domesticGroups = {
      'Major Cities': [
        { code: 'TYO', city: 'Tokyo', name: 'All airports', country: 'Japan', label: 'Tokyo (All airports) (TYO)' },
        ...AIRPORTS.filter(a => a.city === 'Tokyo').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
        { code: 'OSA', city: 'Osaka', name: 'All airports', country: 'Japan', label: 'Osaka (All airports) (OSA)' },
        ...AIRPORTS.filter(a => a.city === 'Osaka').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`}))
      ],
      'Hokkaido': AIRPORTS.filter(a => a.region === 'Hokkaido').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Tohoku': AIRPORTS.filter(a => a.region === 'Tohoku').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Kanto - Shinetsu': AIRPORTS.filter(a => a.region === 'Kanto - Shinetsu' && a.city !== 'Tokyo').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Tokai - Hokuriku': AIRPORTS.filter(a => a.region === 'Tokai - Hokuriku').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Kansai': AIRPORTS.filter(a => a.region === 'Kansai' && a.city !== 'Osaka').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Chugoku': AIRPORTS.filter(a => a.region === 'Chugoku').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Shikoku': AIRPORTS.filter(a => a.region === 'Shikoku').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Kyushu': AIRPORTS.filter(a => a.region === 'Kyushu').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
      'Okinawa': AIRPORTS.filter(a => a.region === 'Okinawa').map(a => ({...a, label: `${a.city} (${a.name}) (${a.code})`})),
    };

    const internationalGroups = AIRPORTS.reduce((acc, airport) => {
      if (airport.country !== 'Japan') {
        if (!acc[airport.country]) {
          acc[airport.country] = [];
        }
        acc[airport.country].push({...airport, label: `${airport.city} (${airport.name}) (${airport.code})`});
      }
      return acc;
    }, {});

    return activeTab === 'domestic' ? domesticGroups : internationalGroups;
  }, [activeTab]);

  // Removed allFilteredAirports useMemo hook
  // Date helpers
  const toISODateString = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseISODateString = (value) => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  // Date dialog state (draft selection and error)
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDateSelection, setTempDateSelection] = useState();
  const [dateError, setDateError] = useState('');

  const isSelectionComplete = useMemo(() => {
    if (tripType === 'one-way') {
      return tempDateSelection instanceof Date;
    }
    if (tripType === 'round-trip') {
      const sel = tempDateSelection;
      const isRange = sel && typeof sel === 'object' && 'from' in sel;
      return Boolean(isRange && sel.from && sel.to);
    }
    return false;
  }, [tripType, tempDateSelection]);

  const openDateDialog = () => {
    setDateError('');
    if (tripType === 'round-trip') {
      const from = parseISODateString(departureDate) || undefined;
      const to = parseISODateString(returnDate) || undefined;
      setTempDateSelection({ from, to });
    } else {
      const dep = parseISODateString(departureDate) || undefined;
      setTempDateSelection(dep);
    }
    setDatePickerOpen(true);
    setIsExpanded(true);
  };

  const applyDateSelection = () => {
    if (tripType === 'round-trip') {
      const isRangeObject = tempDateSelection && typeof tempDateSelection === 'object' && 'from' in tempDateSelection;
      const from = isRangeObject ? tempDateSelection.from : undefined;
      const to = isRangeObject ? tempDateSelection.to : undefined;
      if (!from || !to) {
        setDateError('Please select both a departure and return date.');
        return;
      }
      setDepartureDate(toISODateString(from));
      setReturnDate(toISODateString(to));
    } else {
      if (tempDateSelection instanceof Date) {
        setDepartureDate(toISODateString(tempDateSelection));
        setReturnDate('');
      } else {
        setDateError('Please select a departure date.');
        return;
      }
    }
    setDatePickerOpen(false);
    setDateError('');
  };

  const resetDates = () => {
    setTempDateSelection(undefined);
    setDateError('');
  };

  // Updated function to format the date as a single line string
  const formatDateForDisplay = (dateString) => {
    const date = parseISODateString(dateString);
    if (!date) return '';
    return format(date, 'd EEE MMM, yyyy');
  };

  const handleTripTypeChange = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setTripType('one-way');
      setReturnDate('');
    } else {
      setTripType('round-trip');
    }
  };

  // Passenger Dialog state
  const [tempAdults, setTempAdults] = useState(1);
  const [tempChildren, setTempChildren] = useState(0);
  const [tempInfants, setTempInfants] = useState(0);

  const openPassengerDialog = () => {
    setTempAdults(adults);
    setTempChildren(children);
    setTempInfants(infants);
    setPassengerDialogOpen(true);
    setIsExpanded(true);
  };

  const applyPassengerSelection = () => {
    setAdults(tempAdults);
    setChildren(tempChildren);
    setInfants(tempInfants);
    setPassengerDialogOpen(false);
  };

  const totalPassengers = adults + children + infants;

  // Class dialog state
  const [tempTravelClass, setTempTravelClass] = useState(selectedTravelClass);

  const openClassDialog = () => {
    setTempTravelClass(selectedTravelClass);
    setClassDialogOpen(true);
    setIsExpanded(true);
  };

  const applyClassSelection = () => {
    setSelectedTravelClass(tempTravelClass);
    setClassDialogOpen(false);
  };

  // Discount dialog state
  const [tempDiscount, setTempDiscount] = useState(selectedDiscount);

  const openDiscountDialog = () => {
    setTempDiscount(selectedDiscount);
    setDiscountDialogOpen(true);
    setIsExpanded(true);
  };

  const applyDiscountSelection = () => {
    setSelectedDiscount(tempDiscount);
    setDiscountDialogOpen(false);
  };

  const classOptions = ['Economy Class + Class J', 'Economy Class', 'Class J', 'First Class'];
  const discountOptions = [
    'No discount',
    'JAL CARD',
    'Shareholder',
    'Customer with Disabilities',
    'Care Giver',
    'Remote Island',
    'Senior Citizen',
    'Sky Mate/JALCARD Sky Mate'
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 pt-16 pb-32">
        <div className="max-w-6xl mx-auto px-4">
          {/* Logo area */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-white text-2xl font-bold">JAL</div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white rounded-t-lg overflow-hidden shadow-lg max-w-4xl mx-auto">
            <button
              onClick={() => { setActiveTab('domestic'); setIsExpanded(false); }}
              className={`flex-1 flex items-center justify-center py-4 px-6 transition-colors ${
                activeTab === 'domestic'
                  ? 'bg-white text-red-600 border-b-2 border-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plane className="w-5 h-5 mr-2" />
              Domestic
            </button>
            <button
              onClick={() => { setActiveTab('international'); setIsExpanded(false); }}
              className={`flex-1 flex items-center justify-center py-4 px-6 transition-colors ${
                activeTab === 'international'
                  ? 'bg-white text-red-600 border-b-2 border-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-5 h-5 mr-2" />
              International
            </button>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-b-lg shadow-xl">
          {/* Sub-navigation */}
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex">
                <button className="px-8 py-4 text-red-600 border-b-2 border-red-600 font-medium">
                  Flights
                </button>
                <button className="px-8 py-4 text-gray-500 hover:text-gray-700 font-medium">
                  Award Tickets
                </button>
              </div>
              {isExpanded && (
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 mr-4"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Search Fields */}
          <div className="p-8">
            {/* Trip Type - Only show when expanded */}
            {isExpanded && (
              <div className="flex gap-6 mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="round-trip"
                    checked={tripType === 'round-trip'}
                    onChange={(e) => setTripType(e.target.value)}
                    className="mr-2 accent-red-600"
                  />
                  <span className="text-gray-700">Round-trip</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="one-way"
                    checked={tripType === 'one-way'}
                    onChange={(e) => { setTripType(e.target.value); setReturnDate(''); }}
                    className="mr-2 accent-red-600"
                  />
                  <span className="text-gray-700">One-way</span>
                </label>
              </div>
            )}

            {/* Airport Fields */}
            <div className="flex flex-row gap-4 items-center mb-6">
              {/* From Airport */}
              <div className="flex-1 relative">
                {isExpanded && (
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={fromAirport}
                    onChange={(e) => setFromAirport(e.target.value)}
                    onClick={handleInputClick}
                    className="w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
                    placeholder="From"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <button onClick={() => openAirportPicker('from')} className="text-gray-400 hover:text-gray-600 text-sm flex items-center">
                      <span className="mr-1">All airports</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <Plane className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={swapAirports}
                  className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors mt-6"
                >
                  <ArrowUpDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* To Airport */}
              <div className="flex-1 relative">
                {isExpanded && (
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={toAirport}
                    onChange={(e) => setToAirport(e.target.value)}
                    onClick={handleInputClick}
                    className="w-full pl-12 pr-24 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
                    placeholder="To"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <button onClick={() => openAirportPicker('to')} className="text-gray-400 hover:text-gray-600 text-sm flex items-center">
                      <span className="mr-1">All airports</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <Plane className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 rotate-45" />
                </div>
              </div>

              {/* Multi-city link - Only show when expanded */}
              {isExpanded && (
                <div className="flex items-end pb-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Multi-city →
                  </button>
                </div>
              )}
            </div>

            {/* Expanded Fields - Only show when expanded */}
            {isExpanded && (
              <>
                {/* Date and Passenger Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Date Section */}
                  <div>
                    <div className="flex items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 mr-4">Date</label>
                      <label className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={tripType === 'one-way'}
                          onChange={handleTripTypeChange}
                          className="mr-2 accent-red-600"
                        />
                        One-way
                      </label>
                    </div>

                    {/* Updated button to match the new design */}
                    <button
                      type="button"
                      onClick={openDateDialog}
                      className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-900">
                          {departureDate ? formatDateForDisplay(departureDate) : (
                            <span className="text-gray-400">Select Date</span>
                          )}
                        </span>
                        {tripType === 'round-trip' && (
                          <>
                            <span className="text-gray-400">~</span>
                            <span className="font-medium text-gray-900">
                              {returnDate ? formatDateForDisplay(returnDate) : (
                                <span className="text-gray-400">Select Date</span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </button>

                    {isDatePickerOpen && (
                      <>
                        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDatePickerOpen(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-6 relative">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                              <h3 className="text-xl font-semibold text-gray-900">Boarding Date</h3>
                              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => setDatePickerOpen(false)}>
                                <X className="w-6 h-6" />
                              </button>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-500 my-4">
                              <button onClick={resetDates} className="hover:underline">
                                Reset
                              </button>
                              <span>National Holiday / Substitute Holiday</span>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-center items-center">
                              <DayPicker
                                mode={tripType === 'round-trip' ? 'range' : 'single'}
                                selected={tempDateSelection}
                                onSelect={(sel) => {
                                  setDateError('');
                                  setTempDateSelection(sel);
                                }}
                                disabled={{ before: new Date() }}
                                weekStartsOn={1}
                                numberOfMonths={2}
                                pagedNavigation
                                className="rdp-calendar-container"
                              />
                            </div>

                            {dateError && (
                              <div className="mt-3 text-center text-sm text-red-600">{dateError}</div>
                            )}

                            <div className="mt-6 flex flex-col items-center">
                              <div className="text-base text-gray-700 mb-4">
                                {tempDateSelection && tempDateSelection.from && format(tempDateSelection.from, 'MM-d-yyyy')}
                                {tempDateSelection && tempDateSelection.to && `~${format(tempDateSelection.to, 'MM-d-yyyy')}`}
                              </div>
                              <button
                                type="button"
                                onClick={applyDateSelection}
                                disabled={!isSelectionComplete}
                                className={`w-full max-w-sm py-3 rounded-lg text-lg font-semibold text-white transition ${!isSelectionComplete ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                              >
                                OK
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Passenger Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passenger</label>
                    <button
                      type="button"
                      onClick={openPassengerDialog}
                      className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-900">{totalPassengers}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {adults} Adult, {children} Child, {infants} Infant
                      </div>
                    </button>

                    {isPassengerDialogOpen && (
                      <>
                        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setPassengerDialogOpen(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6 relative">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                              <h3 className="text-xl font-semibold text-gray-900">Passenger</h3>
                              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => setPassengerDialogOpen(false)}>
                                <X className="w-6 h-6" />
                              </button>
                            </div>

                            <div className="space-y-4 my-6">
                              {/* Adult row */}
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-gray-900">Adult</div>
                                  <div className="text-sm text-gray-500">(12+ years)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => tempAdults > 1 && setTempAdults(tempAdults - 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-medium">{tempAdults}</span>
                                  <button
                                    onClick={() => setTempAdults(tempAdults + 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Child row */}
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-gray-900">Child</div>
                                  <div className="text-sm text-gray-500">(3 to 11 years)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => tempChildren > 0 && setTempChildren(tempChildren - 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-medium">{tempChildren}</span>
                                  <button
                                    onClick={() => setTempChildren(tempChildren + 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Infant row */}
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-gray-900">Infant</div>
                                  <div className="text-sm text-gray-500">(0 to 2 years)</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => tempInfants > 0 && setTempInfants(tempInfants - 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-medium">{tempInfants}</span>
                                  <button
                                    onClick={() => setTempInfants(tempInfants + 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="text-sm text-red-600 font-semibold mb-4">
                              Booking for Child and Infant
                            </div>
                            <div className="text-xs text-gray-600 mb-6">
                              <span className="font-bold">ⓘ</span> Each booking may include up to 2 infants, with no more than 1 infant per accompanying adult. A single booking cannot contain more than 9 adults or children in total (excluding accompanying infants).
                            </div>

                            <div className="flex flex-col items-center">
                              <button
                                type="button"
                                onClick={applyPassengerSelection}
                                className="w-full max-w-sm py-3 rounded-lg text-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                              >
                                NEXT
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                </div>

                {/* Class and Discounts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Class Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <button
                      type="button"
                      onClick={openClassDialog}
                      className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <span className="font-medium text-gray-900">{selectedTravelClass}</span>
                    </button>

                    {isClassDialogOpen && (
                      <>
                        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setClassDialogOpen(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl p-6 relative">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                              <h3 className="text-xl font-semibold text-gray-900">Class</h3>
                              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => setClassDialogOpen(false)}>
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                            <div className="space-y-4 my-6">
                              {classOptions.map((option) => (
                                <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                    type="radio"
                                    name="travelClass"
                                    value={option}
                                    checked={tempTravelClass === option}
                                    onChange={() => setTempTravelClass(option)}
                                    className="w-5 h-5 accent-red-600"
                                  />
                                  <span className="ml-3 text-base font-medium text-gray-900">{option}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex flex-col items-center">
                              <button
                                type="button"
                                onClick={applyClassSelection}
                                className="w-full max-w-sm py-3 rounded-lg text-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                              >
                                NEXT
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Discounts Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discounts for limited passenger</label>
                    <button
                      type="button"
                      onClick={openDiscountDialog}
                      className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <span className="font-medium text-gray-900">{selectedDiscount}</span>
                    </button>

                    {isDiscountDialogOpen && (
                      <>
                        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDiscountDialogOpen(false)} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6 relative">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                              <h3 className="text-xl font-semibold text-gray-900">Discounts for limited passenger</h3>
                              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => setDiscountDialogOpen(false)}>
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                            <div className="space-y-4 my-6">
                              {discountOptions.map((option) => (
                                <label key={option} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                    type="radio"
                                    name="discount"
                                    value={option}
                                    checked={tempDiscount === option}
                                    onChange={() => setTempDiscount(option)}
                                    className="w-5 h-5 accent-red-600"
                                  />
                                  <span className="ml-3 text-base font-medium text-gray-900">{option}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex flex-col items-center">
                              <button
                                type="button"
                                onClick={applyDiscountSelection}
                                className="w-full max-w-sm py-3 rounded-lg text-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                              >
                                NEXT
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Search Button */}
            <div className="flex justify-center">
              <button className="flex items-center justify-center px-12 py-4 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors">
                <Search className="w-5 h-5 mr-2" />
                Search flights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Airport Picker Modal */}
      {isAirportPickerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setAirportPickerOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center mt-24 px-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden flex">
              <div className="flex-none w-64 bg-gray-50 border-r border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select {airportPickerFor === 'from' ? 'departure' : 'arrival'} airport</h3>
                  <button onClick={() => setAirportPickerOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Search input field is removed */}
                <div className="space-y-1 mt-4">
                  {Object.keys(groupedAirports).map(groupName => (
                    <button
                      key={groupName}
                      onClick={() => setSelectedGroup(groupName)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedGroup === groupName ? 'bg-red-100 text-red-600 font-semibold' : 'hover:bg-gray-200'}`}
                    >
                      {groupName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4">
                <div className="max-h-96 overflow-y-auto">
                  {groupedAirports[selectedGroup]?.map((a, index) => (
                    <button
                      key={a.code + a.name + index}
                      onClick={() => selectAirport(a)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{a.city} ({a.code})</div>
                        <div className="text-xs text-gray-500">{a.name} • {a.country}</div>
                      </div>
                      <span className="ml-4 inline-flex items-center justify-center text-xs font-semibold bg-gray-100 text-gray-700 rounded px-2 py-1">{a.code}</span>
                    </button>
                  ))}
                  {groupedAirports[selectedGroup]?.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500">No airports found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default FlightSearchUI;