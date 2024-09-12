import React, { useContext, useEffect, useState } from 'react';
import Card from '../../common/Card'
interface AchievementRowProp {
    text: string,
    earned1: boolean,
    earned2: boolean,
    earned3: boolean,
  }
  
interface AchievementsTableProps {
    totalPoints: number
  }
  
interface ItemProps {
    earned: boolean,
    text: string
    // Agrega cualquier otra propiedad que tenga tu token
  }
  

export default function AchievementsTable(props: AchievementsTableProps) {
    const { totalPoints } = props
  return (
        <Card className="col-span-6 xl:col-span-6 h-fit">
          <Card.Body className="space-y-6">
            <AchievementRow text='Primera tarea [1 Punto]: Comprar y holdear' earned1={true} earned2={false} earned3={false}/>
            <AchievementRow text='Segunda tarea [5 Puntos]: Comprar y ganar' earned1={true} earned2={true} earned3={false}/>
            <AchievementRow text='Tercera tarea [10 Puntos]: Comprar, ganar y retirar' earned1={false} earned2={false} earned3={false}/>
            <AchievementRow text='Cuarta Tarea [5 Puntos]: Delegar y retirarse' earned1={true} earned2={false} earned3={false}/>
            <div className='flex w-[47%] items-center justify-between pt-8'>
                <p>Puntos ganados</p>
                <p>{`${totalPoints} de 84`}</p>
            </div>
          </Card.Body>
        </Card>
  );
}

function AchievementRow(props: AchievementRowProp){
    const { text, earned1, earned2, earned3} = props
    return(
        <div className='flex w-[60%] items-center justify-between'>
            <p>{text}</p>
            <div className='flex gap-x-4'>
                <Item text="CDEX" earned={earned1}/>
                <Item text="CLND" earned={earned2}/>
                <Item text="CDFI" earned={earned3}/>
            </div>
        </div>
    )
}

function Item(props : ItemProps){
    const { text, earned } = props
    return(
        <div className='flex flex-col items-center'>
            <img src={earned? '/images/icons/trophy.svg' : '/images/icons/trophyOff.svg'} className='h-16'/>
            <p className='text-sm font-semibold'>{text}</p>
        </div>
    )
}