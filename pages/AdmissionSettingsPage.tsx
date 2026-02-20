import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AdmissionSettings, AdmissionItemConfig, FeeHead } from '@/types';
import { BackIcon, HomeIcon, SaveIcon, PlusIcon, TrashIcon, SpinnerIcon, ChevronDownIcon, ChevronUpIcon, CurrencyDollarIcon } from '@/components/Icons';
import { GRADES_LIST, UNIFORM_SIZES } from '@/constants';

const { useNavigate, Link } = ReactRouterDOM as any;

interface AdmissionSettingsPageProps {
    admissionConfig: AdmissionSettings;
    onUpdateConfig: (config: AdmissionSettings) => Promise<boolean>;
}

const AdmissionSettingsPage: React.FC<AdmissionSettingsPageProps> = ({ admissionConfig, onUpdateConfig }) => {
    const navigate = useNavigate();
    const [config, setConfig] = useState<AdmissionSettings>(admissionConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState(0);
    const [newItemType, setNewItemType] = useState<'general' | 'uniform'>('general');
    
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    useEffect(() => {
        setConfig(admissionConfig);
    }, [admissionConfig]);

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdateConfig(config);
        setIsSaving(false);
        alert('Admission settings saved successfully!');
    };

    const handleItemChange = (id: string, field: keyof AdmissionItemConfig, value: any) => {
        setConfig(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };
    
    const handleSizePriceChange = (itemId: string, size: string, price: number) => {
        setConfig(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    const updatedPriceBySize = { ...item.priceBySize, [size]: price };
                    return { ...item, priceBySize: updatedPriceBySize };
                }
                return item;
            })
        }));
    };

    const handleAddItem = () => {
        if (!newItemName) return;
        
        const priceBySize: Record<string, number> = {};
        if (newItemType === 'uniform') {
            UNIFORM_SIZES.forEach(size => {
                priceBySize[size] = newItemPrice;
            });
        }

        const newItem: AdmissionItemConfig = {
            id: `item-${Date.now()}`,
            name: newItemName,
            price: newItemPrice,
            mandatory: false,
            type: newItemType,
            priceBySize: newItemType === 'uniform' ? priceBySize : undefined
        };
        setConfig(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setNewItemName('');
        setNewItemPrice(0);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            setConfig(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== id)
            }));
        }
    };

    const handleFeeHeadChange = (studentType: 'newStudent' | 'existingStudent', frequency: 'oneTime' | 'annual', index: number, field: keyof FeeHead, value: string | number) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            if (!newConfig.feeStructure) {
                newConfig.feeStructure = {
                    newStudent: { oneTime: [], annual: [] },
                    existingStudent: { oneTime: [], annual: [] }
                };
            }
            
            const updatedList = [...newConfig.feeStructure[studentType][frequency]];
            updatedList[index] = { ...updatedList[index], [field]: value as any };
            
            newConfig.feeStructure[studentType][frequency] = updatedList;
            return newConfig;
        });
    };

    const handleAddFeeHead = (studentType: 'newStudent' | 'existingStudent', frequency: 'oneTime' | 'annual') => {
        setConfig(prev => {
            const newConfig = { ...prev };
             if (!newConfig.feeStructure) {
                newConfig.feeStructure = {
                    newStudent: { oneTime: [], annual: [] },
                    existingStudent: { oneTime: [], annual: [] }
                };
            }
            const newHead: FeeHead = { id: `fee-${Date.now()}`, name: 'New Fee Head', amount: 0 };
            newConfig.feeStructure[studentType][frequency] = [...newConfig.feeStructure[studentType][frequency], newHead];
            return newConfig;
        });
    };

    const handleRemoveFeeHead = (studentType: 'newStudent' | 'existingStudent', frequency: 'oneTime' | 'annual', index: number) => {
        setConfig(prev => {
            const newConfig = { ...prev };
            if (!newConfig.feeStructure) return prev;
            const updatedList = newConfig.feeStructure[studentType][frequency].filter((_, i) => i !== index);
            newConfig.feeStructure[studentType][frequency] = updatedList;
            return newConfig;
        });
    };

    const renderFeeTable = (studentType: 'newStudent' | 'existingStudent', frequency: 'oneTime' | 'annual', title: string) => {
        const fees = config.feeStructure?.[studentType]?.[frequency] || [];

        return (
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wider">{title}</h4>
                    <button onClick={() => handleAddFeeHead(studentType, frequency)} className="text-[10px] btn btn-secondary py-1 px-2">
                        <PlusIcon className="w-3 h-3"/> Add
                    </button>
                </div>
                <div className="border rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-2 text-left text-xs font-semibold text-slate-500">Name</th>
                                <th className="p-2 text-left text-xs font-semibold text-slate-500">Amount (₹)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fees.map((fee, index) => (
                                <tr key={fee.id || index}>
                                    <td className="p-1">
                                        <input 
                                            type="text" 
                                            value={fee.name} 
                                            onChange={(e) => handleFeeHeadChange(studentType, frequency, index, 'name', e.target.value)}
                                            className="w-full border-none focus:ring-0 text-sm py-1 px-2"
                                            placeholder="e.g. Admission Fee"
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input 
                                            type="number" 
                                            value={fee.amount} 
                                            onChange={(e) => handleFeeHeadChange(studentType, frequency, index, 'amount', parseInt(e.target.value) || 0)}
                                            className="w-full border-none focus:ring-0 text-sm py-1 px-2 font-mono"
                                        />
                                    </td>
                                    <td className="p-1 text-center">
                                        <button onClick={() => handleRemoveFeeHead(studentType, frequency, index)} className="text-red-400 hover:text-red-600 p-1">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fees.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-slate-400 italic text-xs">No fee heads configured.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
             <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admission Fee Settings</h1>
                    <p className="text-slate-600 mt-1">Configure separate fee structures for newcomers and returning students.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary shadow-sky-200 shadow-lg">
                    {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                    Save All Settings
                </button>
            </div>

            <div className="space-y-8">
                {/* 1. Admission Fee Structures */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Detailed Fee Breakdown</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* New Student Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b-2 border-sky-500 pb-2">
                                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                                <h3 className="text-lg font-bold text-sky-800">New Student Fees</h3>
                            </div>
                            {renderFeeTable('newStudent', 'oneTime', 'Admission / Registration (One-Time)')}
                            {renderFeeTable('newStudent', 'annual', 'Annual / Periodic Charges')}
                        </div>

                        {/* Existing Student Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b-2 border-emerald-500 pb-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <h3 className="text-lg font-bold text-emerald-800">Existing Student (Re-Admission)</h3>
                            </div>
                            {renderFeeTable('existingStudent', 'oneTime', 'Re-Admission / Processing (One-Time)')}
                            {renderFeeTable('existingStudent', 'annual', 'Annual / Periodic Charges')}
                        </div>
                    </div>
                </section>

                {/* 2. Items Configuration */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Mandatory & Optional Items (For Sale)</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-slate-200 text-slate-700">
                                    <th className="p-3 text-left font-bold">Item Name</th>
                                    <th className="p-3 text-left font-bold">Base Price (₹)</th>
                                    <th className="p-3 text-center font-bold">Mandatory?</th>
                                    <th className="p-3 text-center font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                                {config.items.map(item => (
                                    <React.Fragment key={item.id}>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-2">
                                            <input 
                                                type="text" 
                                                value={item.name} 
                                                onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                                className="form-input w-full py-1 text-sm border-none bg-transparent"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={item.price} 
                                                    onChange={e => handleItemChange(item.id, 'price', parseInt(e.target.value) || 0)}
                                                    className="form-input w-24 py-1 text-sm font-mono"
                                                />
                                                {item.type === 'uniform' && (
                                                     <button 
                                                        onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                                                        className="text-sky-600 hover:text-sky-800 text-[10px] font-bold uppercase underline"
                                                     >
                                                        {expandedItemId === item.id ? 'Close' : 'Prices By Size'}
                                                     </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={item.mandatory} 
                                                onChange={e => handleItemChange(item.id, 'mandatory', e.target.checked)}
                                                className="form-checkbox h-5 w-5 text-sky-600 rounded"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                    {item.type === 'uniform' && expandedItemId === item.id && (
                                        <tr className="bg-sky-50">
                                            <td colSpan={4} className="p-4 border-b border-sky-100">
                                                <p className="text-xs font-bold text-sky-700 mb-3 uppercase tracking-tighter">Set Custom Prices per Size</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
                                                    {UNIFORM_SIZES.map(size => (
                                                        <div key={size} className="space-y-1">
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Size {size}</label>
                                                            <input 
                                                                type="number"
                                                                value={item.priceBySize?.[size] ?? item.price}
                                                                onChange={e => handleSizePriceChange(item.id, size, parseInt(e.target.value) || 0)}
                                                                className="w-full text-xs py-1 border rounded"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Add New Item Form */}
                    <div className="mt-6 p-4 bg-white border border-dashed border-slate-300 rounded-xl flex flex-wrap gap-4 items-end">
                        <div className="flex-grow min-w-[200px]">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">New Item Name</label>
                            <input 
                                type="text" 
                                value={newItemName} 
                                onChange={e => setNewItemName(e.target.value)} 
                                className="form-input w-full text-sm" 
                                placeholder="e.g. Identity Card"
                            />
                        </div>
                        <div className="w-24">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base Price</label>
                            <input 
                                type="number" 
                                value={newItemPrice} 
                                onChange={e => setNewItemPrice(parseInt(e.target.value) || 0)} 
                                className="form-input w-full text-sm font-mono" 
                            />
                        </div>
                         <div className="w-32">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Item Type</label>
                            <select 
                                value={newItemType} 
                                onChange={e => setNewItemType(e.target.value as any)} 
                                className="form-select w-full text-sm" 
                            >
                                <option value="general">General</option>
                                <option value="uniform">Uniform (Sized)</option>
                            </select>
                        </div>
                        <button onClick={handleAddItem} className="btn btn-secondary text-sm">
                            <PlusIcon className="w-4 h-4" /> Add Item
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdmissionSettingsPage;