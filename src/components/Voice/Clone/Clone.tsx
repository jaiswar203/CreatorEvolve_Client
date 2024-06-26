import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MdAddCircleOutline } from 'react-icons/md'
import ProfessionalVoiceClone from './ProfessionalVoiceClone';
import InstantCloneForm from './InstantVoiceClone';
import VoiceDesignForm from './VoiceDesign';
import VoiceCloneOptions from './Option';


const VoiceClonning: React.FC = () => {
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [selectedVoiceCloneOption, setSelectedVoiceCloneOption] = useState<number | null>(null);

    const setOptionHandler = (value: number) => {
        setSelectedVoiceCloneOption(value);
    };

    const onOpenChangeHandler = (open: boolean) => {
        setIsFormDialogOpen(open);
        setSelectedVoiceCloneOption(null);
    };

    const render = (option: number | null) => {
        switch (option) {
            case 0:
                return <VoiceDesignForm setIsFormDialogOpen={setIsFormDialogOpen} />
            case 1:
                return <InstantCloneForm setIsFormDialogOpen={setIsFormDialogOpen} />
            case 2:
                return <ProfessionalVoiceClone setIsFormDialogOpen={setIsFormDialogOpen} />
            default:
                return <VoiceCloneOptions setHandler={setOptionHandler} />
        }
    }

    return (
        <div className="flex justify-end mt-7 px-4">
            <Dialog open={isFormDialogOpen} onOpenChange={onOpenChangeHandler}>
                <DialogTrigger>
                    <Button>
                        <MdAddCircleOutline size={20} className="mr-2" />
                        Add Voice
                    </Button>
                </DialogTrigger>
                <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
                    {render(selectedVoiceCloneOption)}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VoiceClonning