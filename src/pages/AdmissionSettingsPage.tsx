
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AdmissionSettings, AdmissionItemConfig, FeeHead } from '../types';
import { BackIcon, HomeIcon, SaveIcon, PlusIcon, TrashIcon, SpinnerIcon, ChevronDownIcon, ChevronUpIcon, CurrencyDollarIcon } from '../components/Icons';
import { GRADES_LIST, UNIFORM_SIZES } from '../constants';

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
        alert('Settings saved successfully!');
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
        if (window.confirm('Are you sure you want to delete this item?')) {
            setConfig(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== id)
            }));
        }
    };

    const handleNotebookPriceChange = (grade: string, price: number) => {
        setConfig(prev => ({
            ...prev,
            notebookPrices: { ...prev.notebookPrices, [grade]: price }
        }));
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
            const newHead: FeeHead = { id: `fee-${Date.now()}`, name: 'New Fee', amount: 0 };
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
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700 text-sm uppercase">{title}</h3>
                    <button onClick={() => handleAddFeeHead(studentType, frequency)} className="text-xs btn btn-secondary py-1 px-2">
                        <PlusIcon className="w-3 h-3"/> Add Fee
                    </button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-2 text-left w-2/3">Description</th>
                                <th className="p-2 text-left">Amount (₹)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {fees.map((fee, index) => (
                                <tr key={fee.id || index} className="bg-white">
                                    <td className="p-2">
                                        <input 
                                            type="text" 
                                            value={fee.name} 
                                            onChange={(e) => handleFeeHeadChange(studentType, frequency, index, 'name', e.target.value)}
                                            className="form-input w-full py-1"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={fee.amount} 
                                            onChange={(e) => handleFeeHeadChange(studentType, frequency, index, 'amount', parseInt(e.target.value) || 0)}
                                            className="form-input w-full py-1"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => handleRemoveFeeHead(studentType, frequency, index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fees.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-2 text-center text-slate-500 italic">No fees added in this section.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
             <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                    <BackIcon className="w-5 h-5" /> Back
                </button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                    <HomeIcon className="w-5 h-5" /> Home
                </Link>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admission Settings</h1>
                    <p className="text-slate-600">Configure fees, mandatory items, and prices for online admission.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                    {isSaving ? <SpinnerIcon className="w-5 h-5" /> : <SaveIcon className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            <div className="space-y-8">
                {/* General Settings */}
                <section className="bg-slate-50 p-6 rounded-lg border">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">General Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700">Academic Year Label</label>
                            <input 
                                type="text" 
                                value={config.academicYearLabel} 
                                onChange={e => setConfig({ ...config, academicYearLabel: e.target.value })}
                                className="form-input w-full mt-1"
                                placeholder="e.g. 2026-27"
                            />
                            <p className="text-xs text-slate-500 mt-1">This text appears on the admission form header.</p>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-slate-700">Base Admission Fee (Legacy field)</label>
                             <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">₹</div>
                                <input 
                                    type="number" 
                                    value={config.admissionFee} 
                                    onChange={e => setConfig({ ...config, admissionFee: parseInt(e.target.value) || 0 })}
                                    className="form-input w-full pl-8"
                                />
                             </div>
                             <p className="text-xs text-slate-500 mt-1">Note: Individual fee heads below are preferred for detailed breakdown.</p>
                        </div>
                    </div>
                </section>

                {/* Detailed Fee Structure */}
                <section className="bg-slate-50 p-6 rounded-lg border">
                    <div className="flex items-center gap-3 mb-4 border-b pb-2">
                        <CurrencyDollarIcon className="w-6 h-6 text-sky-600" />
                        <h2 className="text-xl font-bold text-slate-800">Admission Fee Structures</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <h3 className="text-lg font-bold text-sky-700 mb-4 border-l-4 border-sky-500 pl-2">New Student Fees</h3>
                            {renderFeeTable('newStudent', 'oneTime', 'One-Time Charges (Admission/Reg.)')}
                            {renderFeeTable('newStudent', 'annual', 'Annual / Periodic Charges (Library/App/Misc)')}
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <h3 className="text-lg font-bold text-emerald-700 mb-4 border-l-4 border-emerald-500 pl-2">Existing Student Fees</h3>
                            {renderFeeTable('existingStudent', 'oneTime', 'One-Time Charges (Re-admission)')}
                            {renderFeeTable('existingStudent', 'annual', 'Annual / Periodic Charges (Library/App/Misc)')}
                        </div>
                    </div>
                </section>

                {/* Notebook Prices */}
                <section className="bg-slate-50 p-6 rounded-lg border">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Notebook Set Prices</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {GRADES_LIST.map(grade => (
                            <div key={grade}>
                                <label className="block text-xs font-bold text-slate-600 mb-1">{grade}</label>
                                <input 
                                    type="number"
                                    value={config.notebookPrices[grade] || 0}
                                    onChange={e => handleNotebookPriceChange(grade, parseInt(e.target.value) || 0)}
                                    className="form-input w-full text-sm py-1"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Items Configuration */}
                <section className="bg-slate-50 p-6 rounded-lg border">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Items for Sale (Uniforms, Books, etc.)</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-slate-200">
                                    <th className="p-2 text-left">Item Name</th>
                                    <th className="p-2 text-left">Base Price (₹)</th>
                                    <th className="p-2 text-center">Mandatory?</th>
                                    <th className="p-2 text-center">Type</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {config.items.map(item => (
                                    <React.Fragment key={item.id}>
                                    <tr className="bg-white">
                                        <td className="p-2">
                                            <input 
                                                type="text" 
                                                value={item.name} 
                                                onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                                className="form-input w-full py-1"
                                            />
                                        </td>
                                        <td className="p-2 w-48">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={item.price} 
                                                    onChange={e => handleItemChange(item.id, 'price', parseInt(e.target.value) || 0)}
                                                    className="form-input w-full py-1"
                                                />
                                                {item.type === 'uniform' && (
                                                     <button 
                                                        onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                                                        className="text-sky-600 hover:text-sky-800 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
                                                        title="Manage prices for different sizes"
                                                     >
                                                        {expandedItemId === item.id ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
                                                        Sizes
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
                                        <td className="p-2 text-center capitalize text-slate-600">{item.type}</td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                    {item.type === 'uniform' && expandedItemId === item.id && (
                                        <tr className="bg-slate-100">
                                            <td colSpan={5} className="p-4 border-b border-slate-300">
                                                <p className="text-xs font-bold text-slate-600 mb-2">Set Prices per Size (Overrides Base Price if set)</p>
                                                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                                                    {UNIFORM_SIZES.map(size => (
                                                        <div key={size}>
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Size {size}</label>
                                                            <input 
                                                                type="number"
                                                                value={item.priceBySize?.[size] ?? item.price}
                                                                onChange={e => handleSizePriceChange(item.id, size, parseInt(e.target.value) || 0)}
                                                                className="form-input w-full text-xs py-1"
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

                    {/* Add New Item */}
                    <div className="mt-4 p-4 bg-white border border-dashed border-slate-300 rounded-lg flex flex-wrap gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-xs font-bold text-slate-500 mb-1">New Item Name</label>
                            <input 
                                type="text" 
                                value={newItemName} 
                                onChange={e => setNewItemName(e.target.value)} 
                                className="form-input w-full" 
                                placeholder="e.g. Belt, Tie"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Base Price</label>
                            <input 
                                type="number" 
                                value={newItemPrice} 
                                onChange={e => setNewItemPrice(parseInt(e.target.value) || 0)} 
                                className="form-input w-full" 
                            />
                        </div>
                         <div className="w-32">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                            <select 
                                value={newItemType} 
                                onChange={e => setNewItemType(e.target.value as any)} 
                                className="form-select w-full" 
                            >
                                <option value="general">General</option>
                                <option value="uniform">Uniform</option>
                            </select>
                        </div>
                        <button onClick={handleAddItem} className="btn btn-secondary">
                            <PlusIcon className="w-5 h-5" /> Add
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdmissionSettingsPage;
